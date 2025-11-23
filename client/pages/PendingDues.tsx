import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";

export default function PendingDues() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin/dashboard" className="hover:opacity-80">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Building2 className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Pending Dues
          </span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="border border-border p-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Pending Dues Tracker
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This page will track all pending dues from residents across
              multiple months, with cumulative totals and alerts for overdue
              amounts.
            </p>
            <p className="text-sm text-muted-foreground">
              Continue prompting me to develop this page further.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
