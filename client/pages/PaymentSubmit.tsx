import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SubmissionStatus = "idle" | "loading" | "success" | "error";

const addPaymentStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-animation {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes float-reverse {
      0%, 100% { transform: translateY(-20px); }
      50% { transform: translateY(0px); }
    }
  `;
  document.head.appendChild(style);
};

export default function PaymentSubmit() {
  useEffect(() => {
    addPaymentStyles();
  }, []);
  const { toast } = useToast();
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const [formData, setFormData] = useState({
    flatNumber: "",
    residentName: "",
    residentType: "owner",
    paymentPurpose: "maintenance",
    amountPaid: "",
    transactionId: "",
    upiId: "",
    bankDetails: "",
    paymentDate: "",
    notes: "",
  });

  const flatNumbers = Array.from({ length: 5 }, (_, floor) =>
    Array.from({ length: 8 }, (_, flat) => `${(floor + 1) * 100 + (flat + 1)}`),
  ).flat();
  // This generates: 101-108, 201-208, 301-308, 401-408, 501-508
  const paymentPurposes = [
    "Maintenance",
    "Repair",
    "Festival Fund",
    "Security Deposit",
    "Water Bill",
    "Electricity Contribution",
    "Others",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.flatNumber) {
      toast({
        title: "Error",
        description: "Please select a flat number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.residentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter transaction ID",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a payment screenshot",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paymentDate) {
      toast({
        title: "Error",
        description: "Please select payment date",
        variant: "destructive",
      });
      return;
    }

    setStatus("loading");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("flatNumber", formData.flatNumber);
      formDataToSend.append("residentName", formData.residentName);
      formDataToSend.append("residentType", formData.residentType);
      formDataToSend.append("paymentPurpose", formData.paymentPurpose);
      formDataToSend.append("amountPaid", formData.amountPaid);
      formDataToSend.append("transactionId", formData.transactionId);
      formDataToSend.append("upiId", formData.upiId);
      formDataToSend.append("bankDetails", formData.bankDetails);
      formDataToSend.append("paymentDate", formData.paymentDate);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("screenshot", file);

      const response = await fetch("/api/payments/submit", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit payment");
      }

      setStatus("success");
      toast({
        title: "Success",
        description: "Payment submitted successfully!",
      });

      setTimeout(() => {
        setStatus("idle");
        setFormData({
          flatNumber: "",
          residentName: "",
          residentType: "owner",
          paymentPurpose: "maintenance",
          amountPaid: "",
          transactionId: "",
          upiId: "",
          bankDetails: "",
          paymentDate: "",
          notes: "",
        });
        setFile(null);
      }, 2000);
    } catch (error) {
      setStatus("error");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit payment",
        variant: "destructive",
      });
    }
  };

  if (status === "success") {
    return (
      <div className="w-full bg-gradient-to-br from-green-50/40 via-background to-blue-50/40 min-h-screen relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

        <nav className="border-b border-border bg-white/50 backdrop-blur-lg sticky top-0 z-50 relative">
          <div className="container mx-auto px-4 py-4 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Treasury Management
            </span>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-md mx-auto text-center fade-in-up">
            <div className="mb-6 flex justify-center scale-in">
              <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3 fade-in-down">
              Payment Submitted!
            </h1>
            <p className="text-muted-foreground mb-8 fade-in">
              Your payment proof has been received. The treasurer will verify it
              shortly. Thank you!
            </p>
            <Link to="/">
              <Button className="glow-effect">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-blue-50/40 via-background to-purple-50/40 min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      {/* Navigation */}
      <nav className="border-b border-border bg-white/50 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 fade-in-left"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Treasury</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Submit Payment Proof
            </h1>
            <p className="text-muted-foreground">
              Upload your payment screenshot and details to register the payment
              for maintenance, repair, or other apartment funds.
            </p>
          </div>

          <Card
            className="rounded-lg p-8 fade-in-up border border-white/30 overflow-hidden"
            style={{
              animationDelay: "0.3s",
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flat Number and Resident Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="flatNumber" className="font-medium mb-2">
                    Flat Number *
                  </Label>
                  <Select
                    value={formData.flatNumber}
                    onValueChange={(value) =>
                      handleSelectChange("flatNumber", value)
                    }
                  >
                    <SelectTrigger id="flatNumber">
                      <SelectValue placeholder="Select flat number" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {flatNumbers.map((flat) => (
                        <SelectItem key={flat} value={flat}>
                          {flat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="residentName" className="font-medium mb-2">
                    Your Name *
                  </Label>
                  <Input
                    id="residentName"
                    name="residentName"
                    placeholder="Enter your full name"
                    value={formData.residentName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Resident Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="residentType" className="font-medium mb-2">
                    Resident Type *
                  </Label>
                  <Select
                    value={formData.residentType}
                    onValueChange={(value) =>
                      handleSelectChange("residentType", value)
                    }
                  >
                    <SelectTrigger id="residentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentPurpose" className="font-medium mb-2">
                    Payment Purpose *
                  </Label>
                  <Select
                    value={formData.paymentPurpose}
                    onValueChange={(value) =>
                      handleSelectChange("paymentPurpose", value)
                    }
                  >
                    <SelectTrigger id="paymentPurpose">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentPurposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose.toLowerCase()}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Amount and Date */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amountPaid" className="font-medium mb-2">
                    Amount Paid (₹) *
                  </Label>
                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    type="number"
                    placeholder="0"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentDate" className="font-medium mb-2">
                    Date of Payment *
                  </Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <Label htmlFor="transactionId" className="font-medium mb-2">
                  Transaction ID / Reference Number *
                </Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  placeholder="e.g., UPI/12345ABCD, NEFT/TXN123"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for verification purposes
                </p>
              </div>

              {/* Payment Method */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="upiId" className="font-medium mb-2">
                    UPI ID (if applicable)
                  </Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    placeholder="example@upi"
                    value={formData.upiId}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bankDetails" className="font-medium mb-2">
                    Bank Account / Cheque Details (if applicable)
                  </Label>
                  <Input
                    id="bankDetails"
                    name="bankDetails"
                    placeholder="Account number or cheque number"
                    value={formData.bankDetails}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <Label htmlFor="screenshot" className="font-medium mb-2 block">
                  Payment Screenshot *
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition cursor-pointer">
                  <input
                    id="screenshot"
                    name="screenshot"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="screenshot" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG, or PDF (max 5MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="font-medium mb-2">
                  Additional Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information you want to provide..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Submitting..." : "Submit Payment"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your information is secure and will only be used by the
                apartment treasurer.
              </p>
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <p className="text-sm text-blue-800">
                The treasurer will verify your payment and update the records
                within 24 hours.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                Keep your proof
              </h3>
              <p className="text-sm text-green-800">
                Always maintain a copy of your payment proof for your records.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Questions?</h3>
              <p className="text-sm text-orange-800">
                Contact the treasurer at treasury@apartment.local for more
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
