import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70"></div>
      <div className="absolute -bottom-8 left-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-70 delay-2000"></div>

      <div className="text-center max-w-md relative z-10">
        <div
          className={`w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 ${isVisible ? "scale-in" : "opacity-0"}`}
        >
          <AlertCircle className="w-8 h-8 text-destructive float" />
        </div>
        <h1
          className={`text-4xl font-bold text-foreground mb-3 ${isVisible ? "fade-in-down" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          404
        </h1>
        <p
          className={`text-lg text-muted-foreground mb-2 ${isVisible ? "fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.3s" }}
        >
          Page not found
        </p>
        <p
          className={`text-sm text-muted-foreground mb-8 ${isVisible ? "fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button
            size="lg"
            className={`glow-effect ${isVisible ? "fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.5s" }}
          >
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
