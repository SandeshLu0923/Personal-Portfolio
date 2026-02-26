import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clinicRoles = new Set(["doctor", "receptionist", "patient"]);
const operationRoles = new Set(["admin", "anesthesiologist", "surgeon", "nurse"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export const getClinicScreenshotsByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    if (!clinicRoles.has(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const folderPath = path.resolve(
      __dirname,
      "../../../client/public/projects/clinic",
      role
    );

    let entries = [];
    try {
      entries = await fs.readdir(folderPath, { withFileTypes: true });
    } catch {
      return res.status(200).json({ role, images: [] });
    }

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((fileName) => ({
        fileName,
        url: `/projects/clinic/${role}/${fileName}`,
      }));

    return res.status(200).json({ role, images });
  } catch (error) {
    next(error);
  }
};

export const getOperationScreenshotsByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    if (!operationRoles.has(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const basePath = path.resolve(
      __dirname,
      "../../../client/public/projects/Operation-Scheduler"
    );
    const roleFolders =
      role === "surgeon" ? ["surgeon", "doctor"] : [role];

    let entries = [];
    let resolvedRoleFolder = role;

    for (const roleFolder of roleFolders) {
      const folderPath = path.resolve(basePath, roleFolder);
      try {
        entries = await fs.readdir(folderPath, { withFileTypes: true });
        resolvedRoleFolder = roleFolder;
        break;
      } catch {
        // Try next fallback folder, if any.
      }
    }

    if (entries.length === 0) {
      return res.status(200).json({ role, images: [] });
    }

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((fileName) => ({
        fileName,
        url: `/projects/Operation-Scheduler/${resolvedRoleFolder}/${fileName}`,
      }));

    return res.status(200).json({ role, images });
  } catch (error) {
    next(error);
  }
};

export const getWeatherScreenshots = async (_req, res, next) => {
  try {
    const folderPath = path.resolve(
      __dirname,
      "../../../client/public/projects/weather"
    );

    let entries = [];
    try {
      entries = await fs.readdir(folderPath, { withFileTypes: true });
    } catch {
      return res.status(200).json({ images: [] });
    }

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((fileName) => ({
        fileName,
        url: `/projects/weather/${fileName}`,
      }));

    return res.status(200).json({ images });
  } catch (error) {
    next(error);
  }
};
