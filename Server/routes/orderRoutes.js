import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSalesReport
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/reports", getSalesReport);

router.patch("/:id/status", updateOrderStatus);

router.get("/", protect, getOrders);
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/sales/report", protect, getSalesReport);
export default router;