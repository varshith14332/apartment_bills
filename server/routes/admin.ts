import { RequestHandler } from "express";
import { AdminLoginRequest, AdminLoginResponse } from "@shared/api";
import { generateToken } from "../middleware/auth";

// Admin credentials - in production, use a real database with hashed passwords
const ADMIN_EMAIL = "ramanjaneyulucherala@gmail.com";
const ADMIN_PASSWORD = "bnr@2025";

export const handleAdminLogin: RequestHandler<
  any,
  AdminLoginResponse,
  AdminLoginRequest
> = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Demo validation - replace with real database lookup and password hashing in production
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generateToken({
      id: "admin-1",
      email: email,
      name: "Apartment Treasurer",
    });

    return res.json({
      token,
      admin: {
        id: "admin-1",
        email: email,
        name: "Apartment Treasurer",
      },
    });
  }

  return res.status(401).json({ message: "Invalid email or password" });
};
