/**
 * Página pública de aprovação de Boletim de Medição
 * Acessível via /aprovacao/:token — sem autenticação
 */
import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, Loader2, AlertCircle } from "lucide-react";

function formatCurrency(val?: string | null) {
  if (!val) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(val));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    rascunho: { label: "Rascunho", variant: "secondary" },
    enviado: { label: "Enviado", variant: "outline" },
    em_aprovacao: { label: "Em Aprovação", variant: "default" },
    aprovado: { label: "Aprovado", variant: "default" },
    rejeitado: { label: "Rejeitado", variant: "destructive" },
    pago: { label: "Pago", variant: "default" },
  };
  const cfg = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default function AprovacaoBoletim() {
  const { token } = useParams<{ token: string }>();
  const [observacoes, setObservacoes] = useState("");
  const [resultado, setResultado] = useState<"aprovado" | "rejeitado" | null>(null);

  const { data: boletim, isLoading, error } = trpc.contratos.aprovacaoPublica.getByToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  const aprovarMutation = trpc.contratos.aprovacaoPublica.aprovarPorToken.useMutation({
    onSuccess: (data) => {
      setResultado(data.status as "aprovado" | "rejeitado");
    },
  });

  const handleDecisao = (aprovado: boolean) => {
    if (!token) return;
    aprovarMutation.mutate({ token, aprovado, observacoes });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Carregando boletim de medição...</p>
        </div>
      </div>
    );
  }

  if (error || !boletim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">Link inválido ou expirado</h2>
            <p className="text-gray-500 text-sm">
              Este link de aprovação não é válido ou já foi utilizado. Entre em contato com o responsável pelo contrato.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const jaDecidido = boletim.status === "aprovado" || boletim.status === "rejeitado";

  if (resultado || jaDecidido) {
    const status = resultado ?? boletim.status;
    const isAprovado = status === "aprovado";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
            {isAprovado ? (
              <CheckCircle className="h-14 w-14 text-green-500" />
            ) : (
              <XCircle className="h-14 w-14 text-red-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {isAprovado ? "Boletim Aprovado!" : "Boletim Rejeitado"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isAprovado
                ? "O boletim de medição foi aprovado com sucesso. O responsável pelo contrato será notificado."
                : "O boletim de medição foi rejeitado. O responsável pelo contrato será notificado para revisão."}
            </p>
            {boletim.observacoesAprovador && (
              <div className="w-full bg-gray-100 rounded-lg p-3 text-left">
                <p className="text-xs text-gray-500 mb-1">Observações registradas:</p>
                <p className="text-sm text-gray-700">{boletim.observacoesAprovador}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#E05A1C] flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aprovação de Boletim de Medição</h1>
            <p className="text-sm text-gray-500">Grupo Arqueo — Sistema de Gestão Contratual</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Boletim #{boletim.numero}</CardTitle>
              <StatusBadge status={boletim.status} />
            </div>
            {boletim.titulo && (
              <p className="text-sm text-gray-600 mt-1">{boletim.titulo}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Valor da Medição</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(boletim.valorMedicao)}</p>
              </div>
              {boletim.percentualMedicao && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Percentual</p>
                  <p className="text-lg font-semibold text-gray-900">{boletim.percentualMedicao}%</p>
                </div>
              )}
              {boletim.periodo && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Período</p>
                  <p className="text-sm text-gray-700">{boletim.periodo}</p>
                </div>
              )}
              {boletim.aprovadorNome && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Responsável</p>
                  <p className="text-sm text-gray-700">{boletim.aprovadorNome}</p>
                </div>
              )}
            </div>
            {boletim.descricao && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descrição</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{boletim.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sua Decisão</CardTitle>
            <p className="text-sm text-gray-500">
              Analise os dados acima e registre sua aprovação ou rejeição do boletim.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Observações (opcional)
              </label>
              <Textarea
                placeholder="Adicione comentários, justificativas ou condições para a sua decisão..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleDecisao(true)}
                disabled={aprovarMutation.isPending}
              >
                {aprovarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Aprovar Boletim
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDecisao(false)}
                disabled={aprovarMutation.isPending}
              >
                {aprovarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Rejeitar Boletim
              </Button>
            </div>
            {aprovarMutation.isError && (
              <p className="text-sm text-red-500 text-center">
                Erro ao processar decisão. Tente novamente.
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          Este link é de uso único e exclusivo para aprovação deste boletim.
          Grupo Arqueo — Sistema de Gestão Contratual
        </p>
      </div>
    </div>
  );
}
