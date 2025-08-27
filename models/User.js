import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  otp: String,
  votes: [
    {
      ballotId: String,
      candidateId: String
    }
  ]
});

export default mongoose.model("User", userSchema);
