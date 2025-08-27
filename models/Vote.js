// models/Vote.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const voteSchema = new Schema(
  {
    email: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, required: true, ref: "Election" },
    candidateId: { type: Schema.Types.ObjectId, required: true, ref: "Candidate" },
  },
  { timestamps: true }
);

// Prevent double voting per election per email
voteSchema.index({ email: 1, electionId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
