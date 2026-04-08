import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SGCBanner } from "@/components/SGCBanner";
import { Link, useLocation } from "wouter";
import {
  Users, Search, Building2, Mail, Phone,
  Loader2, MapPin, Briefcase, FileText, ArrowLeft,
} from "lucide-react";

interface GestaoClientesProps {
  empresaId?: number;
}

export default function GestaoClientes({ empresaId }: GestaoClientesProps = {}) {
  const [, navigate] = useLocation();
  const [busca, setBusca] = useState("");

  const { data: clientes = [], isLoading } = trpc.contratos.clientes.list.useQuery({ empresaId });

  const filtrados = clientes.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      c.razaoSocial?.toLowerCase().includes(q) ||
      c.nomeFantasia?.toLowerCase().includes(q) ||
      c.cnpj?.includes(q) ||
      (c as any).cidade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container py-8">
      <SGCBanner
        message="A gestão de clientes é realizada pelo SGC. Os dados exibidos são somente leitura."
        sgcUrl={empresaId
          ? `${import.meta.env.VITE_SGC_PUBLIC_APP_URL || ''}/empresa/${empresaId}/clientes`
          : (import.meta.env.VITE_SGC_PUBLIC_APP_URL || '')}
        variant="info"
      />
      <div className="mt-4" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          {empresaId && (
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Hub
            </Button>
          )}
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            {empresaId
              ? "Clientes vinculados a esta empresa (somente leitura — gerenciados pelo SGC)"
              : "Cadastro global de clientes (somente leitura — gerenciados pelo SGC)"}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ, cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{clientes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-green-600">
            {clientes.filter((c) => c.status === "ativo").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Com Endereço</p>
          <p className="text-2xl font-bold text-blue-600">
            {clientes.filter((c) => (c as any).cidade).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Filtrados</p>
          <p className="text-2xl font-bold">{filtrados.length}</p>
        </Card>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {busca ? "Nenhum cliente encontrado" : "Nenhum cliente disponível"}
            </h3>
            <p className="text-muted-foreground text-center">
              {busca
                ? `Nenhum resultado para "${busca}"`
                : "Os clientes são gerenciados pelo SGC. Aguardando sincronização de dados."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight truncate">{c.razaoSocial}</CardTitle>
                    {c.nomeFantasia && <p className="text-sm text-muted-foreground truncate">{c.nomeFantasia}</p>}
                    <CardDescription className="font-mono text-xs mt-1">{c.cnpj}</CardDescription>
                  </div>
                  {(c as any).logoUrl ? (
                    <img src={(c as any).logoUrl} alt={c.razaoSocial} className="w-10 h-10 rounded object-contain shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <Badge
                  variant={c.status === "ativo" ? "default" : c.status === "prospecto" ? "outline" : "secondary"}
                  className="w-fit text-xs mt-1"
                >
                  {c.status === "ativo" ? "Ativo" : c.status === "prospecto" ? "Prospecto" : "Inativo"}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 space-y-1.5 pb-3">
                {((c as any).cidade || (c as any).estado) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{[(c as any).cidade, (c as any).estado].filter(Boolean).join(" - ")}</span>
                  </div>
                )}
                {c.telefone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.telefone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {(c as any).cnaeDescricao && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs">{(c as any).cnaeDescricao}</span>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-4 flex items-center border-t pt-3">
                <Link href={`/gestao-clientes/${c.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Ver detalhes
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
