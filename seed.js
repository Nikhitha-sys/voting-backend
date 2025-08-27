import mongoose from "mongoose";
import Ballot from "./models/Ballots.js"; // your ballot model

// Connect to MongoDB
async function seed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/votingdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected for seeding");

    // Clear existing data (optional)
    await Ballot.deleteMany({});

    // Seed data
    const ballots = [
      {
        title: "Favorite Programming Language",
        candidates: [{ name: "Python" }, { name: "JavaScript" }, { name: "Java" }],
      },
      {
        title: "Best Frontend Framework",
        candidates: [{ name: "React" }, { name: "Angular" }, { name: "Vue" }],
      },
    ];

    await Ballot.insertMany(ballots);
    console.log("✅ Ballots inserted successfully");

    // Close connection after seeding
    await mongoose.connection.close();
    console.log("✅ Connection closed");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
}

seed();
