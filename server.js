import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connect } from "mongoose";
import carRotuer from "./src/routes/cars.mjs";
import settingsRouter from "./src/routes/settings.mjs";
import bookingRouter from "./src/routes/booking.mjs";
import path from "path";
import "./src/config/cloudinary.js";


const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;
console.log({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET,
  cloud: process.env.CLOUD_NAME
});

connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/cars", carRotuer);
app.use("/settings", settingsRouter);
app.use("/booking", bookingRouter);
app.get("/db", async (req, res) => {
  res.send({ message: uri });
});

app.listen(port, () => console.log("Server listening on port ", port));
