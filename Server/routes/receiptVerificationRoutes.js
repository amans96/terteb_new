import { Router } from "express";
import { verifyReceiptController } from "../controllers/receiptVerificationController.js";

const router = Router();

router.post("/verify", verifyReceiptController);

export default router;