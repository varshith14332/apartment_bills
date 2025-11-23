import { RequestHandler } from "express";
import { DashboardResponse } from "@shared/api";
import { getDashboardData } from "./payments";

export const handleDashboard: RequestHandler<
  any,
  DashboardResponse,
  any,
  { month?: string }
> = (req, res) => {
  try {
    let month = req.query.month as string;

    if (!month) {
      // Default to current month
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
    }

    // Validate month format (YYYY-MM)
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
