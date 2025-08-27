import mongoose from "mongoose";

const ballotSchema = new mongoose.Schema({
  title: String,
  candidates: [
    {
      name: String,
      votes: { type: Number, default: 0 }
    }
  ]
});

export default mongoose.model("Ballot", ballotSchema);
