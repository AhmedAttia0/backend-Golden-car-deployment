import { Router } from "express";
import bookingSchema from "../models/Booking.mjs";
import validateBooking from "../validations/bookingValidation.mjs";
import Car from "../models/Car.mjs";
const router = Router();

router.get("/", async (req, res) => {
  const bookings = await bookingSchema.find().populate("car");
  res.json(bookings);
});

router.get("/:id", async (req, res) => {
  const booking = await bookingSchema.findById(req.params.id).populate("car");
  if (!booking)
    return res.status(404).send({ message: "لم يتم العثور على الحجز" });
  res.send(booking);
});

router.post("/", async (req, res) => {
  try {
    await validateBooking.validateAsync(req.body);

    const { car: carId, startDate, endDate, totalPrice, status } = req.body;

    const car = await Car.findById(carId);
    if (!car)
      return res.status(404).send({ message: "لم يتم العثور على السيارة" });

    if (car.status === "تحت الصيانة") {
      return res
        .status(400)
        .send({ message: "السيارة تحت الصيانة ولا يمكن حجزها حاليا" });
    }

    const overlappingBooking = await bookingSchema.findOne({
      car: carId,
      $or: [
        { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) },
        },
      ],
      status: { $in: ["قيد الانتظار", "تم التأكيد"] },
    });

    if (overlappingBooking) {
      return res.status(400).send({ message: "السيارة محجوزة في هذا الوقت" });
    }

    const booking = await bookingSchema.create({
      car: carId,
      startDate,
      endDate,
      totalPrice,
      status,
    });

    res.status(201).send({ message: "تم حجز السيارة بنجاح", booking });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await validateBooking.validateAsync(req.body);
    const booking = await bookingSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!booking)
      return res.status(404).send({ message: "لم يتم العثور على الحجز" });
    res.send({ message: "تم تحديث الحجز بنجاح", booking });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
