import express from "express";
import { getbalance, transferAmount } from "../controllers/bankController.js";
const router = express.Router();
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  makeTransaction,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.get("/getBalance/:id", getbalance);

router.post("/transaction", transferAmount);

export default router;
