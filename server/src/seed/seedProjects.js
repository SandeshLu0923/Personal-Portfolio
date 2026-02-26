import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Project } from "../models/Project.js";
import { projectsData } from "./projectsData.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    await Project.deleteMany({});
    await Project.insertMany(projectsData);
    console.log("Projects seeded successfully.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed projects:", error.message);
    process.exit(1);
  }
};

seed();

