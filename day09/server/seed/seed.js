// Run with: npm run seed   (after npm install + mongod running)
import "dotenv/config";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const products = [
  { name: "All-Weather Rain Jacket", category: "Apparel", price: 4500, stock: 20,
    image: "https://picsum.photos/seed/jacket/600/600",
    description: "Lightweight waterproof shell, breathable, packs into its own pocket.",
    tags: ["rain", "waterproof", "outdoor", "lightweight"] },
  { name: "Merino Wool Sweater", category: "Apparel", price: 3800, stock: 15,
    image: "https://picsum.photos/seed/sweater/600/600",
    description: "Soft merino knit for cold nights, naturally odor-resistant.",
    tags: ["warm", "cozy", "winter", "wool"] },
  { name: "Linen Summer Shirt", category: "Apparel", price: 2900, stock: 30,
    image: "https://picsum.photos/seed/shirt/600/600",
    description: "Breathable linen, relaxed fit, perfect for hot days.",
    tags: ["summer", "linen", "casual"] },
  { name: "Insulated Travel Mug", category: "Home", price: 1800, stock: 50,
    image: "https://picsum.photos/seed/mug/600/600",
    description: "Keeps drinks hot 6 hours, leakproof lid, 450ml.",
    tags: ["coffee", "travel", "gift"] },
  { name: "Scented Soy Candle Set", category: "Home", price: 2200, stock: 40,
    image: "https://picsum.photos/seed/candle/600/600",
    description: "Set of 3 hand-poured soy candles, warm vanilla and amber.",
    tags: ["gift", "relax", "home", "cozy"] },
  { name: "Ceramic Plant Pot", category: "Home", price: 1500, stock: 35,
    image: "https://picsum.photos/seed/pot/600/600",
    description: "Minimalist matte ceramic pot with drainage tray.",
    tags: ["plants", "decor", "minimal"] },
  { name: "Wireless Earbuds Pro", category: "Electronics", price: 7500, stock: 25,
    image: "https://picsum.photos/seed/earbuds/600/600",
    description: "Active noise cancelling, 24h battery, USB-C fast charge.",
    tags: ["audio", "anc", "tech", "gift"] },
  { name: "Smart Fitness Band", category: "Electronics", price: 4200, stock: 28,
    image: "https://picsum.photos/seed/band/600/600",
    description: "Heart-rate, sleep tracking, 10-day battery, water resistant.",
    tags: ["fitness", "health", "wearable"] },
  { name: "Portable Bluetooth Speaker", category: "Electronics", price: 5600, stock: 18,
    image: "https://picsum.photos/seed/speaker/600/600",
    description: "Punchy 360 sound, IPX7 waterproof, 12h playtime.",
    tags: ["audio", "outdoor", "party"] },
  { name: "Leather Card Wallet", category: "Accessories", price: 2400, stock: 45,
    image: "https://picsum.photos/seed/wallet/600/600",
    description: "Slim full-grain leather, holds 6 cards, RFID blocking.",
    tags: ["gift", "leather", "everyday"] },
  { name: "Canvas Tote Bag", category: "Accessories", price: 1300, stock: 60,
    image: "https://picsum.photos/seed/tote/600/600",
    description: "Heavy-duty cotton canvas, reinforced straps, everyday carry.",
    tags: ["bag", "eco", "casual"] },
  { name: "Polarized Sunglasses", category: "Accessories", price: 3100, stock: 22,
    image: "https://picsum.photos/seed/sunglasses/600/600",
    description: "UV400 polarized lenses, lightweight frame, includes case.",
    tags: ["summer", "sun", "style", "gift"] },
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  process.exit(0);
})();
