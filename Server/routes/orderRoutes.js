import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSalesReport,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer creates an order
router.post("/", createOrder);

// Admin routes
router.get("/", protect, getOrders);
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/reports", protect, getSalesReport);

export default router;