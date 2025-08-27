import Election from "../models/Election.js";

// Create Election
export const createElection = async (req, res) => {
  try {
    const { name, candidates, startDate, endDate } = req.body;

    const election = new Election({ name, candidates, startDate, endDate });
    await election.save();

    res.status(201).json({
      message: "Election created successfully",
      election,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Elections
export const getElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Election by ID
export const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    res.json(election);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
