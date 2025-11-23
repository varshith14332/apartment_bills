import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Building2,
  Upload,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Smartphone,
} from "lucide-react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-slow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }

      @keyframes float-reverse {
        0%, 100% { transform: translateY(-20px); }
        50% { transform: translateY(0px); }
      }

      @keyframes mesh-gradient {
        0%, 100% { background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%; }
        25% { background-position: 50% 50%, 100% 0%, 0% 100%, 100% 100%; }
        50% { background-position: 100% 100%, 100% 0%, 0% 100%, 100% 100%; }
        75% { background-position: 50% 50%, 0% 100%, 100% 0%, 100% 100%; }
      }

      @keyframes shimmer {
        0% { transform: translateX(-1000px); }
        100% { transform: translateX(1000px); }
      }

      .float-animation {
        animation: float-slow 6s ease-in-out infinite;
      }

      .float-animation-reverse {
        animation: float-reverse 8s ease-in-out infinite;
      }

      .mesh-bg {
        background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 25%, rgba(139,92,246,0.1) 75%, rgba(236,72,153,0.15) 100%);
        background-size: 400% 400%;
        animation: mesh-gradient 15s ease infinite;
      }

      .shimmer-overlay::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 3s infinite;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    addStyles();
  }, []);

  return (
    <div className="w-full bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 fade-in-down"
            style={{ animationDelay: "0s" }}
          >
            <Building2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Treasury Management
            </span>
          </div>
          <Link to="/admin/login">
            <Button
              variant="outline"
              size="sm"
              className="fade-in-down"
              style={{ animationDelay: "0.1s" }}
            >
              Admin Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-32 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70"></div>
        <div className="absolute -bottom-8 left-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70 delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className={isVisible ? "fade-in-up" : "opacity-0"}
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6 bg-clip-text">
                Modern Apartment Treasury Management
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Simplify apartment financial management. Submit payment proofs
                digitally, track maintenance funds, and manage resident dues
                with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/submit-payment">
                  <Button size="lg" className="w-full sm:w-auto glow-effect">
                    Submit Payment <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Upload,
                  title: "Easy Uploads",
                  desc: "Submit payment proofs instantly",
                  delay: "0.3s",
                },
                {
                  icon: BarChart3,
                  title: "Auto Reports",
                  desc: "Monthly summaries generated",
                  delay: "0.4s",
                },
                {
                  icon: Users,
                  title: "Resident Tracking",
                  desc: "Monitor all flat contributions",
                  delay: "0.5s",
                },
                {
                  icon: Clock,
                  title: "Real-time Updates",
                  desc: "Track dues in real-time",
                  delay: "0.6s",
                },
              ].map(({ icon: Icon, title, desc, delay }) => (
                <div
                  key={title}
                  className="glass rounded-lg p-6 hover:glass-dark transition-all duration-300 transform hover:scale-105 fade-in-up"
                  style={{ animationDelay: delay }}
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Dashboard Teaser */}
      <section className="py-12 md:py-16 bg-white/50 backdrop-blur-lg border-y border-border">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            This Month's Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                label: "Total Collected",
                value: "₹45,200",
                count: "From 18 flats",
                icon: CheckCircle,
                color: "blue",
                delay: "0.4s",
              },
              {
                label: "Total Pending",
                value: "₹12,500",
                count: "From 7 flats",
                icon: Clock,
                color: "orange",
                delay: "0.5s",
              },
              {
                label: "Flats Paid",
                value: "18",
                count: "72% collection rate",
                icon: Users,
                color: "green",
                delay: "0.6s",
              },
              {
                label: "Not Paid",
                value: "7",
                count: "Out of 25 total",
                icon: Building2,
                color: "red",
                delay: "0.7s",
              },
            ].map(({ label, value, count, icon: Icon, color, delay }, idx) => {
              const colors = {
                blue: "from-blue-50 to-blue-100/50 border-blue-200",
                orange: "from-orange-50 to-orange-100/50 border-orange-200",
                green: "from-green-50 to-green-100/50 border-green-200",
                red: "from-red-50 to-red-100/50 border-red-200",
              };

              const iconColors = {
                blue: "text-blue-600",
                orange: "text-orange-600",
                green: "text-green-600",
                red: "text-red-600",
              };

              const textColors = {
                blue: "text-blue-900",
                orange: "text-orange-900",
                green: "text-green-900",
                red: "text-red-900",
              };

              return (
                <div
                  key={label}
                  className={`glass-dark rounded-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-300 scale-in fade-in-up`}
                  style={{ animationDelay: delay }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {value}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-lg flex items-center justify-center`}
                    >
                      <Icon
                        className={`w-5 h-5 ${iconColors[color as keyof typeof iconColors]}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Powerful Features for Apartment Management
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "Digital Payment Proofs",
                description:
                  "Residents submit screenshots of payment transfers. No more paper trails or manual verification.",
                points: [
                  "Multiple payment methods",
                  "Instant submission",
                  "Secure uploads",
                ],
                delay: "0.5s",
              },
              {
                icon: BarChart3,
                title: "Automated Reports",
                description:
                  "Monthly tables auto-generated showing collection status, pending dues, and payment details.",
                points: [
                  "PDF/Excel export",
                  "Payment breakdowns",
                  "Historical tracking",
                ],
                delay: "0.6s",
              },
              {
                icon: Users,
                title: "Resident Management",
                description:
                  "Track owners and tenants. Auto-flag overdue payments and cumulative pending dues.",
                points: [
                  "Flat master records",
                  "Payment history",
                  "Dues alerts",
                ],
                delay: "0.7s",
              },
              {
                icon: Shield,
                title: "Admin Controls",
                description:
                  "Treasurer login dashboard to verify submissions, mark payments, and manage flat records.",
                points: [
                  "Secure JWT auth",
                  "Role-based access",
                  "Activity logs",
                ],
                delay: "0.8s",
              },
              {
                icon: Smartphone,
                title: "PWA & Mobile",
                description:
                  "Fully responsive, installable on Android and iOS. Works offline with sync when online.",
                points: [
                  "Offline support",
                  "Mobile installable",
                  "Fast & responsive",
                ],
                delay: "0.9s",
              },
              {
                icon: Clock,
                title: "Real-time Tracking",
                description:
                  "Track pending dues month-by-month. Get auto-alerts for overdue payments and maintain history.",
                points: [
                  "Cumulative tracking",
                  "Auto-alerts",
                  "Payment status",
                ],
                delay: "1.0s",
              },
            ].map(({ icon: Icon, title, description, points, delay }, idx) => (
              <div
                key={title}
                className="glass rounded-lg p-8 hover:glass-dark transition-all duration-300 border border-white/20 hover:border-white/40 transform hover:translate-y-[-8px] hover:scale-105 fade-in-up"
                style={{ animationDelay: delay }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground mb-4">{description}</p>
                <ul className="space-y-2">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-white/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div
          className="container mx-auto px-4 text-center relative z-10 fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Your Apartment Treasury?
          </h2>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
            Start submitting payment proofs today. It only takes a few minutes
            to upload your proof.
          </p>
          <Link to="/submit-payment">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold glow-effect"
            >
              Submit Payment Proof Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 backdrop-blur-lg border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div
            className="grid md:grid-cols-4 gap-8 mb-8 fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">Treasury</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern apartment financial management made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">
                For Residents
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/submit-payment"
                    className="hover:text-primary transition"
                  >
                    Submit Payment
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Payment Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Admin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/admin/login"
                    className="hover:text-primary transition"
                  >
                    Admin Login
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="mailto:support@treasury.local"
                    className="hover:text-primary transition"
                  >
                    support@treasury.local
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+91-90000-00000"
                    className="hover:text-primary transition"
                  >
                    +91 90000 00000
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Apartment Treasury Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
