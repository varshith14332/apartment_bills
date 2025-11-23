import { RequestHandler } from "express";
import { PaymentSubmitRequest } from "@shared/api";

// In-memory storage for demo purposes
// In production, use MongoDB or another database
interface PaymentRecord extends PaymentSubmitRequest {
  id: string;
  screenshotUrl: string;
  month: string;
  createdAt: Date;
}

const payments: PaymentRecord[] = [];

export const handlePaymentSubmit: RequestHandler = async (req, res) => {
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

    // Validate required fields
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

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Screenshot is required" });
    }

    // Validate amount
    const amount = parseFloat(amountPaid);
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get current month in YYYY-MM format
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    // Check for duplicate transaction ID in same month
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

    // In production, upload file to cloud storage (Cloudinary, Firebase, etc.)
    // For now, create a mock URL
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

// Helper function to get dashboard data
export const getDashboardData = (month: string) => {
  const monthPayments = payments.filter((p) => p.month === month);

  const totalCollected = monthPayments.reduce(
    (sum, p) => sum + p.amountPaid,
    0,
  );
  const uniqueFlats = new Set(monthPayments.map((p) => p.flatNumber));
  const flatsPaid = uniqueFlats.size;

  // For demo purposes, assume 40 total flats (5 floors × 8 flats each)
  const totalFlats = 40;
  const flatsNotPaid = totalFlats - flatsPaid;

  // Calculate total pending based on maintenance amount
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

export const getMonthlyPayments = (month: string) => {
  return payments
    .filter((p) => p.month === month)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

export const getRecentPayments = (limit: number = 10) => {
  return payments
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
};

export const getAllPayments = () => {
  return payments;
};
