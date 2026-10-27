import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;