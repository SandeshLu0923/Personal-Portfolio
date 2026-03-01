import { PROJECT_SLUGS } from "../constants/projectConfig";

export const getProjectSlug = (project) => {
  if (!project) return "";
  if (project.slug) return project.slug;

  const title = project.title || "";
  if (title === "Clinic Management System") return PROJECT_SLUGS.clinic;
  if (title === "Real-Time Weather App") return PROJECT_SLUGS.weather;
  if (title === "Operation Scheduler For Hospital Management") {
    return PROJECT_SLUGS.operation;
  }

  return "";
};
