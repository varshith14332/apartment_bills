import serverless from "serverless-http";
import express from "express";
import "dotenv/config";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleDemo } from "../server/routes/demo";
import { handleAdminLogin } from "../server/routes/admin";
import {
  handlePaymentSubmit,
  getMonthlyPayments,
  getRecentPayments,
  getAllPayments,
} from "../server/routes/payments";
import { handleDashboard } from "../server/routes/dashboard";
import { authenticateToken } from "../server/middleware/auth";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(process.cwd(), "uploads/"));
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "pong";
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

// SPA fallback - serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

export default serverless(app);
