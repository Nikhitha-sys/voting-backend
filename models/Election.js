// models/Election.js
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 } // <-- add vote counter
});

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  candidates: [candidateSchema]
});

export default mongoose.model("Election", electionSchema);
