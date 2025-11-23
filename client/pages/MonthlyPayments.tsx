import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ArrowLeft,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentRecord {
  id: string;
  flatNumber: string;
  residentName: string;
  amountPaid: number;
  transactionId: string;
  paymentPurpose: string;
  screenshotUrl: string;
  residentType: "owner" | "tenant";
  paymentDate: string;
  createdAt: string;
  notes?: string;
}

export default function MonthlyPayments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [screenshotModal, setScreenshotModal] = useState<{
    isOpen: boolean;
    url: string;
  }>({ isOpen: false, url: "" });

  const TOTAL_FLATS = 40;
  const MAINTENANCE_PER_FLAT = 5000;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchMonthlyPayments();

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchMonthlyPayments();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedMonth, navigate]);

  const fetchMonthlyPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/monthly-payments?month=${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1);
    return date.toISOString().slice(0, 7);
  });

  const getPaidFlats = () => {
    const uniqueFlats = new Set(payments.map((p) => p.flatNumber));
    return uniqueFlats.size;
  };

  const getTotalCollected = () => {
    return payments.reduce((sum, p) => sum + p.amountPaid, 0);
  };

  const getPendingAmount = (paidFlats: number) => {
    const unpaidFlats = TOTAL_FLATS - paidFlats;
    return unpaidFlats * MAINTENANCE_PER_FLAT;
  };

  const paidFlats = getPaidFlats();
  const totalCollected = getTotalCollected();
  const pendingAmount = getPendingAmount(paidFlats);

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

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="hover:opacity-80">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Monthly Payments
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Month Selector and Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass p-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Month
            </label>
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
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="glass p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Total Collected
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalCollected.toLocaleString()}
              </p>
            </Card>
            <Card className="glass p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{pendingAmount.toLocaleString()}
              </p>
            </Card>
          </div>
        </div>

        {/* Payments Table */}
        <Card className="glass p-6 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : payments.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Flat No
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Name
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Amount Paid
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Transaction ID
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Screenshot
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <div key={payment.id}>
                      <tr className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4 text-foreground">
                          {payment.flatNumber}
                        </td>
                        <td className="py-4 px-4 text-foreground">
                          {payment.residentName}
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">
                          ₹{payment.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                          {payment.transactionId}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Paid
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setScreenshotModal({
                                isOpen: true,
                                url: payment.screenshotUrl,
                              })
                            }
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === payment.id ? null : payment.id,
                              )
                            }
                          >
                            {expandedRow === payment.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      {expandedRow === payment.id && (
                        <tr className="bg-secondary/20 border-b border-border">
                          <td colSpan={7} className="py-4 px-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-foreground mb-3">
                                  Payment Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Purpose:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground">
                                      {payment.paymentPurpose}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Resident Type:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground capitalize">
                                      {payment.residentType}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Payment Date:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground">
                                      {new Date(
                                        payment.paymentDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Submitted:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground">
                                      {new Date(
                                        payment.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-3">
                                  Additional Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Pending Amount:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground">
                                      -
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Pending Month:
                                    </span>
                                    <span className="ml-2 font-medium text-foreground">
                                      -
                                    </span>
                                  </div>
                                  {payment.notes && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Notes:
                                      </span>
                                      <p className="mt-1 text-foreground italic">
                                        "{payment.notes}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Payments Yet
                </h3>
                <p className="text-muted-foreground">
                  No payments submitted for {formatMonth(selectedMonth)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Screenshot Modal */}
      {screenshotModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setScreenshotModal({ isOpen: false, url: "" })}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background">
              <h3 className="font-semibold text-foreground">
                Payment Screenshot
              </h3>
              <button
                onClick={() => setScreenshotModal({ isOpen: false, url: "" })}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={screenshotModal.url}
                alt="Payment screenshot"
                className="w-full rounded-lg border border-border"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
