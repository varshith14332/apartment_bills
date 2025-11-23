import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleDemo } from "./routes/demo";
import { handleAdminLogin } from "./routes/admin";
import {
  handlePaymentSubmit,
  getMonthlyPayments,
  getRecentPayments,
  getAllPayments,
} from "./routes/payments";
import { handleDashboard } from "./routes/dashboard";
import { authenticateToken } from "./middleware/auth";

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin routes
  app.post("/api/admin/login", handleAdminLogin);

  // Payment routes
  app.post(
    "/api/payments/submit",
    upload.single("screenshot"),
    handlePaymentSubmit,
  );

  // Dashboard routes (protected)
  app.get("/api/admin/dashboard", authenticateToken, handleDashboard);

  // Get monthly payments (protected)
  app.get("/api/admin/monthly-payments", authenticateToken, (_req, res) => {
    try {
      const month = _req.query.month as string;
      if (!month) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const data = getMonthlyPayments(currentMonth);
        return res.json(data);
      }
      const data = getMonthlyPayments(month);
      res.json(data);
    } catch (error) {
      console.error("Error fetching monthly payments:", error);
      res.status(500).json({ message: "Failed to fetch monthly payments" });
    }
  });

  // Get recent payments (protected)
  app.get("/api/admin/recent-payments", authenticateToken, (_req, res) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 10;
      const data = getRecentPayments(limit);
      res.json(data);
    } catch (error) {
      console.error("Error fetching recent payments:", error);
      res.status(500).json({ message: "Failed to fetch recent payments" });
    }
  });

  // Export payments report (protected)
  app.get("/api/admin/export-report", authenticateToken, (_req, res) => {
    try {
      const month = _req.query.month as string;
      const data = month ? getMonthlyPayments(month) : getAllPayments();

      // Create CSV content
      const headers = [
        "Flat No",
        "Name",
        "Amount Paid",
        "Transaction ID",
        "Paid Status",
        "Payment Date",
        "Purpose",
        "Resident Type",
        "Notes",
      ];
      const rows = data.map((payment) => [
        payment.flatNumber,
        payment.residentName,
        `₹${payment.amountPaid}`,
        payment.transactionId,
        "Paid",
        new Date(payment.paymentDate).toLocaleDateString(),
        payment.paymentPurpose,
        payment.residentType,
        payment.notes || "-",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="payments-${month || "all"}.csv"`,
      );
      res.send(csv);
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  return app;
}
