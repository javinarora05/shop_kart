require("dotenv").config();
const mongoose = require("mongoose");

// Same DNS fix as index.js so mongodb+srv (Atlas) URIs resolve
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const Product = require("../models/product.model");

const sampleProducts = [
  {
    name: "Mirrorless Pro Camera Kit",
    description: "24MP APS-C sensor camera with 18-55mm kit lens, 4K video recording, and built-in Wi-Fi for instant photo transfer.",
    price: 42999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    stock: 7,
  },
  {
    name: "Nova X 5G Smartphone",
    description: "6.5-inch AMOLED display, 108MP triple camera, 5000mAh battery with 67W fast charging, and 8GB RAM.",
    price: 24999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    stock: 21,
  },
  {
    name: "UltraSlim 14 Laptop",
    description: "Featherweight 14-inch laptop with 16GB RAM, 512GB SSD, backlit keyboard, and all-day 12-hour battery life.",
    price: 58999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    stock: 9,
  },
  {
    name: "Ergo Silent Wireless Mouse",
    description: "Contoured ergonomic mouse with silent clicks, 2.4GHz nano receiver, adjustable DPI, and 18-month battery life.",
    price: 799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    stock: 60,
  },
  {
    name: "FitPulse Smartwatch",
    description: "AMOLED smartwatch with heart-rate and SpO2 monitoring, 100+ sport modes, and 10-day battery backup.",
    price: 4299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    stock: 27,
  },
  {
    name: "RetroSnap Instant Camera",
    description: "Classic instant film camera with auto exposure, built-in flash, and selfie mirror for prints in seconds.",
    price: 6499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    stock: 13,
  },
  {
    name: "StudioBeat Wired Headphones",
    description: "Lightweight on-ear studio headphones with 40mm drivers, tangle-free cable, and inline microphone.",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    stock: 38,
  },
  {
    name: "Next-Gen Gaming Console",
    description: "Ultra-fast SSD gaming console with 4K 120fps output, ray tracing, and a wireless haptic controller.",
    price: 49990,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    stock: 5,
  },
  {
    name: "VisionMax 55-inch 4K Smart TV",
    description: "55-inch 4K UHD smart TV with HDR10, Dolby Audio, built-in streaming apps, and voice remote.",
    price: 38999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
    stock: 6,
  },
  {
    name: "Crimson Flyknit Running Shoes",
    description: "Breathable knit running shoes with springy foam midsole and grippy rubber outsole for daily miles.",
    price: 3799,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    stock: 24,
  },
  {
    name: "Volt Training Sneakers",
    description: "Neon lightweight cross-training sneakers with flexible forefoot and stable heel for gym workouts.",
    price: 2899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
    stock: 19,
  },
  {
    name: "Essential Cotton Crew Tee",
    description: "Soft 100% combed cotton crew-neck t-shirt with a relaxed fit that stays in shape wash after wash.",
    price: 499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    stock: 80,
  },
  {
    name: "Classic Slim-Fit Denim",
    description: "Stretch denim jeans in a slim fit with a mid-rise waist and five-pocket styling.",
    price: 1599,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    stock: 33,
  },
  {
    name: "Biker Leather Jacket",
    description: "Genuine leather biker jacket with asymmetric zip, quilted shoulders, and satin lining.",
    price: 5999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    stock: 11,
  },
  {
    name: "Polarized Wayfarer Sunglasses",
    description: "UV400 polarized sunglasses with a lightweight acetate frame that cuts glare on sunny days.",
    price: 999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    stock: 45,
  },
  {
    name: "Everyday Laptop Backpack",
    description: "Water-repellent 25L backpack with padded 15.6-inch laptop sleeve and hidden anti-theft pocket.",
    price: 1499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    stock: 29,
  },
  {
    name: "Scarlet Top-Handle Handbag",
    description: "Structured vegan leather handbag with top handle, detachable strap, and gold-tone hardware.",
    price: 2299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  },
  {
    name: "Milk and Honey by Rupi Kaur",
    description: "A bestselling collection of poetry and prose about love, loss, trauma, healing, and femininity.",
    price: 349,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    stock: 50,
  },
  {
    name: "The Startup Reading Bundle",
    description: "A curated stack of business and startup classics covering product design, growth, and leadership.",
    price: 1999,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Velvet 3-Seater Sofa",
    description: "Mid-century modern 3-seater sofa in emerald velvet with solid wood legs and deep cushioned seats.",
    price: 27999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    stock: 4,
  },
  {
    name: "Nordic Arc Floor Lamp",
    description: "Matte grey adjustable floor lamp with a metal dome shade, perfect for reading corners.",
    price: 2799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    stock: 17,
  },
  {
    name: "Matte Ceramic Coffee Mug",
    description: "350ml handcrafted ceramic mug with a matte glaze finish, microwave and dishwasher safe.",
    price: 299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    stock: 70,
  },
  {
    name: "Succulent in Mint Planter",
    description: "Low-maintenance live succulent potted in a mint ceramic planter, ideal for desks and windowsills.",
    price: 449,
    category: "Home",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    stock: 40,
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert catalog products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedDB();
