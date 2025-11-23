import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "b252958fa98b6971299ca334e79204238517df22f1c210a4ad36751163c83707072116929eafe7e1258a6e8e3c4c3f7831da9938783a1f9830ae76eef9be824c";

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const generateToken = (payload: {
  id: string;
  email: string;
  name: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};
