
import { Router } from "express";
import Incident from "../models/Incident.js";

const router = Router();

const VALID_SEVERITIES = ["Critical", "High", "Medium", "Low"];

const VALID_STATUSES = [
  "Reported",
  "Dispatched",
  "Responding",
  "Resolved",
];

// GET all incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
    });
  }
});

// GET one incident by MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    return res.json({
      success: true,
      data: incident,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid incident ID",
    });
  }
});

// POST a new incident
router.post("/", async (req, res) => {
  try {
    const { type, location, severity, latitude, longitude } =
      req.body ?? {};

    // Validate required fields
    if (
      typeof type !== "string" ||
      !type.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      !VALID_SEVERITIES.includes(severity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid type, location, and severity.",
      });
    }

    // Coordinates are optional, but must be provided together.
    const hasLatitude =
      latitude !== undefined && latitude !== null && latitude !== "";
    const hasLongitude =
      longitude !== undefined &&
      longitude !== null &&
      longitude !== "";

    if (hasLatitude !== hasLongitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be provided together.",
      });
    }

    let coordinates = {};

    if (hasLatitude && hasLongitude) {
      // Accept numeric values and numeric strings from JSON clients.
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude or longitude.",
        });
      }

      coordinates = {
        latitude: lat,
        longitude: lng,
      };
    }

    const incident = await Incident.create({
      type: type.trim(),
      location: location.trim(),
      severity,
      ...coordinates,
    });

    return res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      data: incident,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to create incident",
    });
  }
});

// PATCH incident status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body ?? {};

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident status",
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    return res.json({
      success: true,
      message: "Incident status updated",
      data: incident,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Could not update incident. Check the incident ID.",
    });
  }
});

export default router;
