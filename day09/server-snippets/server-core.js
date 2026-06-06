// ===== server/index.js =====
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`ShopWave API on :${PORT}`))
);

// ===== server/config/db.js =====
import mongoose from "mongoose";
export default async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopwave";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

// ===== server/models/Product.js =====
import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: { type: String, index: true },
    price: { type: Number, required: true }, // LKR
    image: String,
    stock: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);
export default mongoose.model("Product", productSchema);

// ===== server/models/Order.js =====
import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, qty: Number }],
    total: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);
export default mongoose.model("Order", orderSchema);

// ===== server/routes/products.routes.js =====
import { Router } from "express";
import Product from "../models/Product.js";
const router = Router();
router.get("/", async (_req, res) => {
  const data = await Product.find().lean();
  res.json({ success: true, data });
});
router.get("/:id", async (req, res) => {
  const data = await Product.findById(req.params.id).lean();
  res.json(data ? { success: true, data } : { success: false, error: "Not found" });
});
export default router;

// ===== server/.env.example =====
// ANTHROPIC_API_KEY=sk-ant-...
// MONGO_URI=mongodb://127.0.0.1:27017/shopwave
// PORT=5000
