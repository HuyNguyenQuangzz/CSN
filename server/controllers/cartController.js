const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart (or update qty)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, attributes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
            priceAtAdd: product.price,
            attributes,
          },
        ],
      });
      return res.status(201).json(cart);
    }

    // find if same product + attributes exists
    const idx = cart.items.findIndex(
      (it) =>
        it.product.toString() === productId &&
        JSON.stringify(it.attributes || {}) === JSON.stringify(attributes || {})
    );

    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAdd: product.price,
        attributes,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity for an item
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (quantity <= 0) {
      item.remove();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.remove();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
