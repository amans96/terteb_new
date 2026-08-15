import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  res.json({
imageUrl: `https://terteb-new-1.onrender.com/uploads/${req.file.filename}`,
  });
});

export default router;