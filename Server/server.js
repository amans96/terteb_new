import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// =====================================
// CORS
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://terteb-new-order.vercel.app",
  "https://terteb-new-os.vercel.app/",
   "https://localhost:5175",
    "https://terteb-os-new.vercel.app"
];


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// =====================================
// BODY PARSING
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// UPLOADED IMAGES
// =====================================

app.use("/uploads", express.static("uploads"));

// =====================================
// API ROUTES
// =====================================

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {
  res.json({
    message: "Terteb API running",
  });
});

// =====================================
// SERVER
// =====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});