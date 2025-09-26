const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

// ========== REGISTER ==========
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Tạo token verify
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const url = `${process.env.CLIENT_URL}/verify/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<a href="${url}">Click here to verify</a>`,
    });

    res.json({ msg: "Registration successful, please check your email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// ========== LOGIN ==========
exports.login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (recaptchaToken) {
      const secretKey = process.env.RECAPTCHA_SECRET;
      const googleRes = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
      );
      if (!googleRes.data.success) {
        return res.status(400).json({ error: "reCAPTCHA failed" });
      }
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!user.isVerified)
      return res.status(400).json({ error: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      msg: "Login success",
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== LOGOUT ==========
exports.logout = async (req, res) => {
  try {
    // Nếu dùng DB lưu refresh token thì xoá ở đây
    // Với frontend localStorage thì chỉ cần xoá ở client
    res.json({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== REFRESH TOKEN ==========
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token provided" });

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Reset your password",
      html: `<a href="${url}">Click here to reset password</a>`,
    });

    res.json({ msg: "Password reset link sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// ========== CHANGE PASSWORD ==========
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Old password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
