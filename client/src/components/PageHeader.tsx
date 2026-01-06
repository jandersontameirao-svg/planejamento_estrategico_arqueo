import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  showHome?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  showBack = true, 
  showHome = true 
}: PageHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    setLocation("/");
  };

  return (
    <div className="border-b bg-gradient-to-r from-background to-accent/20 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              {showHome && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHome}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Início
                </Button>
              )}
            </div>
            <div className="border-l pl-4">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
