import { Project } from "../models/Project.js";

export const getProjects = async (_req, res, next) => {
  try {
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

