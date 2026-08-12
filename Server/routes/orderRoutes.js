import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSalesReport
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/reports", getSalesReport);

router.patch("/:id/status", updateOrderStatus);

export default router;