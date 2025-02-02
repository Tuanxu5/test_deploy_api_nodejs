import express from "express";
import LocationController from "../controllers/location.controller.js";

const router = express.Router();

const locationController = new LocationController();

router.get("/locations", locationController.getAllLocation);
router.post("/locations", locationController.addNewLocation);
router.put("/locations", locationController.updateLocationOrder);
router.patch("/locations/:id", locationController.updateLocationInformation);
router.delete("/locations/:id", locationController.deleteLocation);

export default router;