import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link } from "wouter";

interface PageHeaderWithBackProps {
  title: string;
  description?: string;
  backUrl: string;
  actions?: React.ReactNode;
}

export default function PageHeaderWithBack({
  title,
  description,
  backUrl,
  actions,
}: PageHeaderWithBackProps) {
  return (
    <div className="border-b bg-white">
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Logo Grupo Arqueo */}
          <div className="flex items-center gap-2 text-[#8b1538]">
            <Building2 className="h-8 w-8" />
            <div className="text-sm font-semibold">
              <div>GRUPO</div>
              <div className="text-[#f97316]">ARQUEO</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
