const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "products"
    );
    if (!wishlist) return res.json({ products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId],
      });
      return res.status(201).json(wishlist);
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
