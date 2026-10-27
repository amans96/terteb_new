import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSalesReport,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const requireWaiterOrAdmin = (req, res, next) => {
  if (!["STAFF", "ADMIN"].includes(req.user?.role)) {
    return res.status(403).json({
      message: "Waiter or admin access required.",
    });
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};

// Customer: place an order.
router.post("/", createOrder);

// Waiter and admin: view orders and update order status.
router.get("/", protect, requireWaiterOrAdmin, getOrders);
router.patch(
  "/:id/status",
  protect,
  requireWaiterOrAdmin,
  updateOrderStatus
);

// Admin only: view sales reports.
router.get("/reports", protect, requireAdmin, getSalesReport);

export default router;