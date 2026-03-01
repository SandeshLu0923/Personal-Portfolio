import { Project } from "../models/Project.js";

const slugFromTitle = (title = "") =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProjects = async (_req, res, next) => {
  try {
    const projects = await Project.find()
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    const normalizedProjects = projects.map((project) => ({
      ...project,
      slug: project.slug || slugFromTitle(project.title),
    }));
    res.status(200).json(normalizedProjects);
  } catch (error) {
    next(error);
  }
};
