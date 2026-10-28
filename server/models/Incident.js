
import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["Critical", "High", "Medium", "Low"],
    },
    status: {
      type: String,
      enum: ["Reported", "Dispatched", "Responding", "Resolved"],
      default: "Reported",
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
