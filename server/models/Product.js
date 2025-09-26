const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // percent
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    category: { type: String, index: true },
    brand: String,
    stock: { type: Number, default: 0 },
    attributes: { type: Object, default: {} }, // size, color, ...
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
