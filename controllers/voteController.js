// controllers/voteController.js
import mongoose from "mongoose";
import Vote from "../models/Vote.js";

export const castVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const email = req.user?.email;

  if (!email) return res.status(401).json({ error: "Unauthorized" });
  if (!electionId || !candidateId) {
    return res.status(400).json({ error: "electionId and candidateId are required" });
  }

  try {
    const vote = await Vote.create({
      email,
      electionId: new mongoose.Types.ObjectId(electionId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
    });
    return res.json({ message: "Vote recorded", voteId: vote._id });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "You have already voted in this election" });
    }
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const resultsByElection = async (req, res) => {
  const { electionId } = req.params;
  if (!electionId) return res.status(400).json({ error: "electionId is required" });

  try {
    const results = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: "$candidateId", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
    ]);

    return res.json({ electionId, results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
