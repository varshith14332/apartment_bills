import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  LogOut,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Settings,
  Download,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnimationDelay {
  delay: string;
}

interface DashboardData {
  totalCollected: number;
  totalPending: number;
  flatsPaid: number;
  flatsNotPaid: number;
  month: string;
}

interface RecentPayment {
  id: string;
  flatNumber: string;
  residentName: string;
  amountPaid: number;
  paymentPurpose: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCollected: 45200,
    totalPending: 12500,
    flatsPaid: 18,
    flatsNotPaid: 7,
    month: selectedMonth,
  });
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchDashboardData();

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedMonth, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [dashboardResponse, recentResponse] = await Promise.all([
        fetch(`/api/admin/dashboard?month=${selectedMonth}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/recent-payments?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dashboardResponse.ok || !recentResponse.ok) {
        if (dashboardResponse.status === 401 || recentResponse.status === 401) {
          navigate("/admin/login");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboardData = await dashboardResponse.json();
      const recentData = await recentResponse.json();

      setDashboardData(dashboardData);
      setRecentPayments(recentData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/export-report?month=${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to export report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payments-${selectedMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return date.toISOString().slice(0, 7);
  });

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const collectionPercentage = (
    (dashboardData.flatsPaid /
      (dashboardData.flatsPaid + dashboardData.flatsNotPaid)) *
    100
  ).toFixed(0);

  return (
    <div className="w-full bg-background min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 fade-in-left">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Admin Dashboard
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 fade-in-right"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header and Month Selector */}
        <div className="mb-8 fade-in-down" style={{ animationDelay: "0.2s" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Treasury Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor apartment collections and pending dues
              </p>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Collected */}
          <Card
            className="glass p-6 hover:glass-dark transition-all duration-300 transform hover:scale-105 fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Collected
                </p>
                <p className="text-3xl font-bold text-foreground">
                  ₹{dashboardData.totalCollected.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center glow-effect">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              From {dashboardData.flatsPaid} flats
            </p>
          </Card>

          {/* Total Pending */}
          <Card
            className="glass p-6 hover:glass-dark transition-all duration-300 transform hover:scale-105 fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-foreground">
                  ₹{dashboardData.totalPending.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center glow-effect">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              From {dashboardData.flatsNotPaid} flats
            </p>
          </Card>

          {/* Flats Paid */}
          <Card
            className="glass p-6 hover:glass-dark transition-all duration-300 transform hover:scale-105 fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Flats Paid
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData.flatsPaid}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center glow-effect">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {collectionPercentage}% collection rate
            </p>
          </Card>

          {/* Flats Not Paid */}
          <Card
            className="glass p-6 hover:glass-dark transition-all duration-300 transform hover:scale-105 fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Not Paid
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData.flatsNotPaid}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center glow-effect">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {dashboardData.flatsPaid + dashboardData.flatsNotPaid}{" "}
              total
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 fade-in" style={{ animationDelay: "0.7s" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/monthly-payments">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary hover:glass transition-all duration-300 fade-in-up"
                style={{ animationDelay: "0.75s" }}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Monthly Table</span>
              </Button>
            </Link>

            <Link to="/admin/pending-dues">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary hover:glass transition-all duration-300 fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm">Pending Dues</span>
              </Button>
            </Link>

            <Link to="/admin/flat-master">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary hover:glass transition-all duration-300 fade-in-up"
                style={{ animationDelay: "0.85s" }}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-sm">Flat Master</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary hover:glass transition-all duration-300 fade-in-up"
              onClick={handleExportReport}
              style={{ animationDelay: "0.9s" }}
            >
              <Download className="w-5 h-5" />
              <span className="text-sm">Export Report</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <Card
          className="glass p-6 fade-in-up"
          style={{ animationDelay: "0.95s" }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => {
                const date = new Date(payment.createdAt);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));

                let timeLabel = "";
                if (diffMinutes < 1) {
                  timeLabel = "Just now";
                } else if (diffMinutes < 60) {
                  timeLabel = `${diffMinutes}m ago`;
                } else if (diffHours < 24) {
                  timeLabel = `${diffHours}h ago`;
                } else if (diffDays === 1) {
                  timeLabel = "Yesterday";
                } else if (diffDays < 7) {
                  timeLabel = `${diffDays}d ago`;
                } else {
                  timeLabel = date.toLocaleDateString();
                }

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Payment from Flat {payment.flatNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{payment.amountPaid.toLocaleString()} -{" "}
                        {payment.paymentPurpose}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{timeLabel}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent payments</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
