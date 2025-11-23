import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const addLoginStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes float-soft {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      33% { transform: translateY(-15px) translateX(10px); }
      66% { transform: translateY(15px) translateX(-10px); }
    }

    .login-gradient {
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
    }
  `;
  document.head.appendChild(style);
};

export default function AdminLogin() {
  useEffect(() => {
    addLoginStyles();
  }, []);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background blobs with enhanced effects */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-75"></div>
      <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-accent/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-75 delay-2000"></div>
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-purple-300/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div
          className="flex items-center justify-center gap-3 mb-8 fade-in-down"
          style={{ animationDelay: "0s" }}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center float">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Treasury</h1>
        </div>

        {/* Login Card */}
        <Card
          className="glass p-8 shadow-lg fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin Login
            </h2>
            <p className="text-muted-foreground">Treasurer dashboard access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email" className="font-medium mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="treasurer@apartment.local"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="font-medium mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2 text-xs bg-secondary rounded p-3">
              <p>
                <strong>Email:</strong> admin@apartment.local
              </p>
              <p>
                <strong>Password:</strong> admin123
              </p>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
