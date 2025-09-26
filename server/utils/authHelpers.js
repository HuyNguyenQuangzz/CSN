const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hash mật khẩu trước khi lưu vào DB
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// So sánh mật khẩu khi login
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Tạo Access Token (ngắn hạn, ví dụ 15m)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// Tạo Refresh Token (dài hạn, ví dụ 7d)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

// Verify token (Access / Refresh)
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

// Tạo link xác minh email
const generateVerifyLink = (user, token) => {
  return `${process.env.CLIENT_URL}/verify/${token}`;
};

// Tạo link reset password
const generateResetPasswordLink = (token) => {
  return `${process.env.CLIENT_URL}/reset-password/${token}`;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateVerifyLink,
  generateResetPasswordLink,
};
