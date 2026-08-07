import express from 'express'
const router=express.Router();
router.get("/",(req,res)=>{
    res.send("all the foods are here ")
})
 export default router; 