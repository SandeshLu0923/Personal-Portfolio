import { Router } from "express";
import {
  getClinicScreenshotsByRole,
  getOperationScreenshotsByRole,
  getWeatherScreenshots,
} from "../controllers/screenshotController.js";

const router = Router();

router.get("/clinic/:role", getClinicScreenshotsByRole);
router.get("/operation/:role", getOperationScreenshotsByRole);
router.get("/weather", getWeatherScreenshots);

export default router;
