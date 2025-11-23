import { Handler } from "@netlify/functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const authenticateToken = (req: any, res: any, next: any) => {
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

const generateToken = (payload: {
  id: string;
  email: string;
  name: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

const handleDemo = (req: any, res: any) => {
  const response = {
    message: "Hello from Netlify function",
  };
  res.status(200).json(response);
};

const handleAdminLogin = (req: any, res: any) => {
  const ADMIN_EMAIL = "admin@apartment.local";
  const ADMIN_PASSWORD = "admin123";

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

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

interface PaymentRecord {
  id: string;
  flatNumber: string;
  residentName: string;
  residentType: "owner" | "tenant";
  paymentPurpose: string;
  amountPaid: number;
  transactionId: string;
  upiId?: string;
  bankDetails?: string;
  paymentDate: string;
  notes?: string;
  screenshotUrl: string;
  month: string;
  createdAt: Date;
}

const payments: PaymentRecord[] = [];

const handlePaymentSubmit = async (req: any, res: any) => {
  try {
    const {
      flatNumber,
      residentName,
      residentType,
      paymentPurpose,
      amountPaid,
      transactionId,
      upiId,
      bankDetails,
      paymentDate,
      notes,
    } = req.body;

    if (
      !flatNumber ||
      !residentName ||
      !residentType ||
      !paymentPurpose ||
      !amountPaid ||
      !transactionId ||
      !paymentDate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Screenshot is required" });
    }

    const amount = parseFloat(amountPaid);
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const duplicate = payments.find(
      (p) =>
        p.transactionId === transactionId &&
        p.flatNumber === flatNumber &&
        p.month === month,
    );

    if (duplicate) {
      return res.status(400).json({
        message:
          "This transaction ID has already been submitted for this flat this month",
      });
    }

    const screenshotUrl = `/uploads/${req.file.filename}`;

    const payment: PaymentRecord = {
      id: `payment-${Date.now()}`,
      flatNumber,
      residentName,
      residentType: residentType as "owner" | "tenant",
      paymentPurpose,
      amountPaid: amount,
      transactionId,
      upiId: upiId || "",
      bankDetails: bankDetails || "",
      paymentDate,
      notes: notes || "",
      screenshotUrl,
      month,
      createdAt: new Date(),
    };

    payments.push(payment);

    res.status(201).json({
      message: "Payment submitted successfully",
      payment,
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({ message: "Failed to submit payment" });
  }
};

const getDashboardData = (month: string) => {
  const monthPayments = payments.filter((p) => p.month === month);
  const totalCollected = monthPayments.reduce(
    (sum, p) => sum + p.amountPaid,
    0,
  );
  const uniqueFlats = new Set(monthPayments.map((p) => p.flatNumber));
  const flatsPaid = uniqueFlats.size;
  const totalFlats = 40;
  const flatsNotPaid = totalFlats - flatsPaid;
  const maintenancePerFlat = 5000;
  const totalPending = flatsNotPaid * maintenancePerFlat;

  return {
    totalCollected,
    totalPending,
    flatsPaid,
    flatsNotPaid,
    month,
  };
};

const getMonthlyPayments = (month: string) => {
  return payments
    .filter((p) => p.month === month)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

const getRecentPayments = (limit: number = 10) => {
  return payments
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
};

const getAllPayments = () => {
  return payments;
};

const handleDashboard = (req: any, res: any) => {
  try {
    let month = req.query.month as string;

    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const data = getDashboardData(month);
    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
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

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "pong";
  res.json({ message: ping });
});

app.get("/api/demo", handleDemo);

app.post("/api/admin/login", handleAdminLogin);

app.post(
  "/api/payments/submit",
  upload.single("screenshot"),
  handlePaymentSubmit,
);

app.get("/api/admin/dashboard", authenticateToken, handleDashboard);

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

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

const handler: Handler = async (event, context) => {
  try {
    return new Promise((resolve, reject) => {
      app(event as any, context as any, (err: any) => {
        if (err) reject(err);
      });
    });
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export { handler };
