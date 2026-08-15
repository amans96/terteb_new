import express, { Router } from 'express';
import {
    createMenuItems,
    getMenuItems,
    updateMenuItem,
    deleteMenuItems
} from '../controllers/MenuController.js';
router.post("/",createMenuItems);
router.get("/",getMenuItems);
router.get("/:id", getMenuItems); 
router.put("/:id",updateMenuItem);
router.delete("/:id",deleteMenuItems);
export default router;
