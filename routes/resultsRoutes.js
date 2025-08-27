import express from "express";
import Vote from "../models/Vote.js";

const router = express.Router();

// GET results for a ballot
router.get("/:ballotId", async (req, res) => {
  try {
    const { ballotId } = req.params;

    // Fetch all votes for this ballot
    const votes = await Vote.find({ ballotId });

    // Tally votes
    const tally = {};
    votes.forEach((v) => {
      tally[v.candidateId] = (tally[v.candidateId] || 0) + 1;
    });

    res.json({ ballotId, results: tally });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
