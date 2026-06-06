import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await Product.find().lean();
  res.json({ success: true, data });
});

router.get("/:id", async (req, res) => {
  const data = await Product.findById(req.params.id).lean();
  res.json(
    data ? { success: true, data } : { success: false, error: "Not found" }
  );
});

export default router;
