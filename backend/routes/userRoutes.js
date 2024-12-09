import express from "express";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";

const router = express.Router();

// Update profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.theme = req.body.theme || user.theme;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        theme: updatedUser.theme,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update theme
router.put("/theme", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.theme = req.body.theme;
      const updatedUser = await user.save();
      res.json({
        theme: updatedUser.theme
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update avatar
router.put("/avatar", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: "User not found or no file uploaded" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update password
router.put("/password", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(req.body.currentPassword))) {
      user.password = req.body.newPassword;
      await user.save();
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(401).json({ message: "Invalid current password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete account
router.delete("/account", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "Account deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;