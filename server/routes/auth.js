const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

module.exports = router;
