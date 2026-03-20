/**
 * BoletimAprovacao.tsx — Página pública de aprovação de Boletim de Medição
 * Rota: /boletim-aprovacao/:token
 * Acesso: sem login (publicProcedure)
 * Fluxo: aprovador externo recebe link por e-mail → acessa esta página → aprova ou rejeita
 */
import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, FileText, DollarSign, Calendar,
  User, AlertTriangle, Loader2, ClipboardCheck,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_aprovacao: "Aguardando Aprovação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  pago: "Pago",
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  enviado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  em_aprovacao: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  aprovado: "bg-green-500/20 text-green-400 border-green-500/30",
  rejeitado: "bg-red-500/20 text-red-400 border-red-500/30",
  pago: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function formatCurrency(v: string | number | null | undefined) {
  if (!v) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function BoletimAprovacao() {
  const [, params] = useRoute("/boletim-aprovacao/:token");
  const token = params?.token ?? "";

  const [observacoes, setObservacoes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  const { data: boletim, isLoading, error } = trpc.boletins.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const aprovarMut = trpc.boletins.aprovarViaToken.useMutation({
    onSuccess: () => {
      setDone("approved");
      toast.success("Boletim aprovado com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const rejeitarMut = trpc.boletins.rejeitarViaToken.useMutation({
    onSuccess: () => {
      setDone("rejected");
      toast.success("Boletim rejeitado.");
    },
    onError: (e) => toast.error(e.message),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-red-500/30">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold mb-2">Link inválido</h1>
            <p className="text-sm text-muted-foreground">Este link de aprovação é inválido ou expirou.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !boletim) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-red-500/30">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold mb-2">Boletim não encontrado</h1>
            <p className="text-sm text-muted-foreground">Este link de aprovação é inválido, expirou ou já foi utilizado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resultado final após aprovação/rejeição
  if (done === "approved") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-green-500/30 bg-green-500/5">
          <CardContent className="py-10 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
            <h1 className="text-xl font-bold text-green-400">Boletim Aprovado!</h1>
            <p className="text-sm text-muted-foreground">
              O boletim <strong>{boletim.numero}</strong> foi aprovado com sucesso.
              O gestor do projeto foi notificado.
            </p>
            {observacoes && (
              <div className="text-left bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Suas observações:</p>
                <p className="text-sm">{observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-red-500/30 bg-red-500/5">
          <CardContent className="py-10 text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-red-400">Boletim Rejeitado</h1>
            <p className="text-sm text-muted-foreground">
              O boletim <strong>{boletim.numero}</strong> foi rejeitado.
              O gestor do projeto foi notificado com o motivo informado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyDecided = boletim.status === "aprovado" || boletim.status === "rejeitado" || boletim.status === "pago";
  const canDecide = boletim.status === "em_aprovacao";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 text-orange-500" />
            </div>
            <span className="font-bold text-lg">Grupo Arqueo</span>
          </div>
          <h1 className="text-2xl font-bold">Aprovação de Boletim de Medição</h1>
          <p className="text-sm text-muted-foreground">
            Você foi solicitado a revisar e aprovar o boletim de medição abaixo.
          </p>
        </div>

        {/* Status atual */}
        {isAlreadyDecided && (
          <Card className={`border ${boletim.status === "aprovado" || boletim.status === "pago" ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <CardContent className="py-4 flex items-center gap-3">
              {boletim.status === "aprovado" || boletim.status === "pago" ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">
                  Este boletim já foi {boletim.status === "aprovado" || boletim.status === "pago" ? "aprovado" : "rejeitado"}.
                </p>
                {boletim.observacoesAprovador && (
                  <p className="text-xs text-muted-foreground mt-1">Observações: {boletim.observacoesAprovador}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do Boletim */}
        <Card className="border border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                {boletim.titulo || boletim.numero}
              </CardTitle>
              <Badge className={`text-xs border ${STATUS_COLORS[boletim.status] ?? ""}`}>
                {STATUS_LABELS[boletim.status] ?? boletim.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Número
                </p>
                <p className="text-sm font-mono font-medium">{boletim.numero}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Valor da Medição
                </p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(boletim.valorMedicao)}</p>
              </div>
              {boletim.periodo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Período
                  </p>
                  <p className="text-sm">{boletim.periodo}</p>
                </div>
              )}
              {boletim.dataEnvio && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Enviado em
                  </p>
                  <p className="text-sm">{formatDate(boletim.dataEnvio)}</p>
                </div>
              )}
            </div>
            {boletim.descricao && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="text-sm">{boletim.descricao}</p>
              </div>
            )}
            {boletim.aprovadorNome && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Aprovador: <strong className="text-foreground">{boletim.aprovadorNome}</strong></span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ação de aprovação */}
        {canDecide && (
          <Card className="border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Sua Decisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botões de ação */}
              {!action && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setAction("approve")}
                    className="bg-green-600 hover:bg-green-700 text-white h-12"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => setAction("reject")}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-12"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Rejeitar
                  </Button>
                </div>
              )}

              {/* Confirmação de aprovação */}
              {action === "approve" && (
                <div className="space-y-4">
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-400 font-medium">Confirmar aprovação</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ao aprovar, o gestor do projeto será notificado automaticamente.
                    </p>
                  </div>
                  <div>
                    <Label>Observações (opcional)</Label>
                    <Textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      placeholder="Adicione observações se necessário..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAction(null)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={() => aprovarMut.mutate({ token, observacoes: observacoes || undefined })}
                      disabled={aprovarMut.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {aprovarMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Confirmar Aprovação
                    </Button>
                  </div>
                </div>
              )}

              {/* Confirmação de rejeição */}
              {action === "reject" && (
                <div className="space-y-4">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-red-400 font-medium">Confirmar rejeição</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Informe o motivo da rejeição. O gestor será notificado.
                    </p>
                  </div>
                  <div>
                    <Label>Motivo da Rejeição *</Label>
                    <Textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      placeholder="Descreva o motivo da rejeição..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAction(null)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={() => {
                        if (!observacoes.trim()) {
                          toast.error("Informe o motivo da rejeição.");
                          return;
                        }
                        rejeitarMut.mutate({ token, observacoes });
                      }}
                      disabled={rejeitarMut.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {rejeitarMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Confirmar Rejeição
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Este link é de uso único e foi enviado especificamente para você.
          Grupo Arqueo — Sistema de Gestão de Contratos
        </p>
      </div>
    </div>
  );
}
