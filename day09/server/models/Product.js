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
