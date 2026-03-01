import { PROJECT_SLUGS } from "../constants/projectConfig";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProjectSlug = (project) => {
  if (!project) return "";
  if (project.slug) return project.slug;

  const normalizedTitle = slugify(project.title || "");
  if (normalizedTitle.includes("clinic")) return PROJECT_SLUGS.clinic;
  if (normalizedTitle.includes("weather")) return PROJECT_SLUGS.weather;
  if (
    normalizedTitle.includes("operation-scheduler") ||
    normalizedTitle.includes("operation") ||
    normalizedTitle.includes("hospital-management")
  ) {
    return PROJECT_SLUGS.operation;
  }

  return "";
};
