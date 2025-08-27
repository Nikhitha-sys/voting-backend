import Election from "../models/Election.js";
import Vote from "../models/Vote.js";

// Get live results
export const getResults = async (req, res) => {
  try {
    // Fetch all elections
    const elections = await Election.find();

    // For each election, count votes per candidate
    const results = await Promise.all(
      elections.map(async (election) => {
        const candidatesWithVotes = await Promise.all(
          election.candidates.map(async (candidate) => {
            const voteCount = await Vote.countDocuments({
              electionId: election._id,
              candidateId: candidate._id,
            });
            return {
              _id: candidate._id,
              name: candidate.name,
              votes: voteCount,
            };
          })
        );

        return {
          _id: election._id,
          title: election.title,
          candidates: candidatesWithVotes,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Error fetching results" });
  }
};
