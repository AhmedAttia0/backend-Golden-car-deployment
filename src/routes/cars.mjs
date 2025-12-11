import { Router } from "express";
import Car from "../models/Car.mjs";
import validateCar from "../validations/carValidation.mjs";
import { upload } from "../middleware/uploadImages.mjs";
import { uploadToCloudinary } from "../utilts/uploadToCloudinary.mjs";
const router = Router();

router.get("/", async (req, res) => {
  let {
    type,
    brand,
    model,
    min_price,
    max_price,
    ac,
    page = 1,
    limit = 10,
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const filters = {};
  if (type) {
    const types = type.split(",");
    filters.type = { $in: types };
  }
  if (brand) {
    const brands = brand.split(",");
    filters.brand = { $in: brands };
  }
  if (model) {
    const models = model.split(",");
    filters.model = { $in: models };
  }
  if (min_price) {
    filters.price = { $gte: min_price };
  }
  if (max_price) {
    filters.price = { $lte: max_price };
  }
  if (ac) {
    filters.ac = ac;
  }

  const cars = await Car.find(filters);
  const total = cars.length;
  const total_pages = Math.ceil(total / limit);
  if (page > total_pages && total_pages > 0)
    return res.status(404).send({ message: "Page not found" });
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedCars = cars.slice(startIndex, endIndex);
  res.send({
    page,
    limit,
    totalCars: total,
    totalPages: total_pages,
    cars: paginatedCars,
  });
});

router.get("/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car)
    return res.status(404).send({ message: "لم يتم العثور على السيارة" });
  res.send(car);
});

router.post("/", upload.array("carImages", 4), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send({ message: "يجب رفع صورة واحدة على الأقل" });
    }

    const imageUrls = [];
    for (let file of files) {
      const url = await uploadToCloudinary(file.buffer, "cars");
      imageUrls.push(url);
    }

    const carData = {
      ...req.body,
      images: imageUrls,
    };

    const car = await Car.create(carData);

    res.status(201).send({ message: "تم اضافة السيارة بنجاح", car });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await validateCar.validateAsync(req.body);
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!car)
      return res.status(404).send({ message: "لم يتم العثور على السيارة" });
    res.send({ message: "تم تحديث السيارة بنجاح", car });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car)
    return res.status(404).send({ message: "لم يتم العثور على السيارة" });
  res.send({ message: "تم حذف السيارة بنجاح", car });
});

export default router;
