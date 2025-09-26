const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create order from cart (checkout)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart empty" });

    // build items snapshot
    const items = cart.items.map((it) => ({
      product: it.product._id,
      name: it.product.title,
      price: it.priceAtAdd,
      quantity: it.quantity,
      attributes: it.attributes,
    }));

    const itemsPrice = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // example
    const taxPrice = Math.round(itemsPrice * 0.1 * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Optionally: reduce product stock here (omitted for simplicity)
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: paymentMethod === "cod" ? "pending" : "processing",
      isPaid: paymentMethod === "cod" ? false : false,
    });

    // clear cart
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single order (user or admin)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ensure owner or admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. shipped, delivered, cancelled

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "delivered") order.deliveredAt = Date.now();
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
