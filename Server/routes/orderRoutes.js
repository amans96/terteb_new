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

// Admin gets orders
router.get("/", protect, getOrders);

// Admin updates order status
router.patch("/:id/status", protect, updateOrderStatus);

// Admin sales report
router.get("/reports", protect, getSalesReport);

export default router;