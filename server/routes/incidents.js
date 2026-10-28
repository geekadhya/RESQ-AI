
import { Router } from "express";
import Incident from "../models/incident.js";

const router = Router();

// GET all incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    res.status(500).json({
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

    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid incident ID",
    });
  }
});

// POST a new incident
router.post("/", async (req, res) => {
  try {
    const { type, location, severity } = req.body ?? {};

    if (
      typeof type !== "string" ||
      !type.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      !["Critical", "High", "Medium", "Low"].includes(severity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid type, location, and severity.",
      });
    }

    const incident = await Incident.create({
      type: type.trim(),
      location: location.trim(),
      severity,
    });

    res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create incident",
    });
  }
});

// PATCH incident status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body ?? {};
    const validStatuses = [
      "Reported",
      "Dispatched",
      "Responding",
      "Resolved",
    ];

    if (!validStatuses.includes(status)) {
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

    res.json({
      success: true,
      message: "Incident status updated",
      data: incident,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not update incident. Check the incident ID.",
    });
  }
});

export default router;
