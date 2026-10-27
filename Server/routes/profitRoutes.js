import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
    getProfitSummary,
    getDailyProfitReport,
} from "../controllers/profitController.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getProfitSummary);
router.get("/daily", getDailyProfitReport);

export default router;