import express, { Router } from 'express';
import {
    createMenuItems,
    getMenuItems,
    updateMenuItem,
    deleteMenuItems
} from '../controllers/menuController.js';
const router =express.Router();
router.post("/",createMenuItems);
router.get("/",getMenuItems);
router.get("/:id", getMenuItems); 
router.put("/:id",updateMenuItem);
router.delete("/:id",deleteMenuItems);
export default router;
