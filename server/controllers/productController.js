const Product = require("../models/Product");

// Create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    // ensure unique slug if needed
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List products (with simple pagination & filters)
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, q, category, minPrice, maxPrice } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    res.json({ data: products, page: Number(page), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
