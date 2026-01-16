import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/hooks/useNotification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Clock } from "lucide-react";

interface VersionHistoryProps {
  empresaId: number;
}

export default function VersionHistory({ empresaId }: VersionHistoryProps) {
  const notification = useNotification();
  const utils = trpc.useUtils();
  const { data: versions, isLoading } = trpc.templates.listVersions.useQuery({ empresaId });
  
  const revertMutation = trpc.templates.revertToVersion.useMutation({
    onSuccess: () => {
      notification.success("Configuração revertida com sucesso!");
      utils.templates.getConfig.invalidate({ empresaId });
      utils.templates.listVersions.invalidate({ empresaId });
    },
    onError: (error) => {
      notification.error(`Erro ao reverter: ${error.message}`);
    },
  });

  const handleRevert = (versionNumber: number) => {
    if (confirm(`Deseja reverter para a versão ${versionNumber}? A configuração atual será substituída.`)) {
      revertMutation.mutate({ empresaId, versionNumber });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Versões
          </CardTitle>
          <CardDescription>Carregando histórico...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Versões
          </CardTitle>
          <CardDescription>Nenhuma versão salva ainda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Versões
        </CardTitle>
        <CardDescription>
          {versions.length} versão{versions.length !== 1 ? "ões" : ""} salva{versions.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Versão {version.versionNumber}</Badge>
                    {version.versionNumber === versions[0].versionNumber && (
                      <Badge className="bg-green-500">Atual</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(version.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                {version.versionNumber !== versions[0].versionNumber && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevert(version.versionNumber)}
                    disabled={revertMutation.isPending}
                    className="gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reverter
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Cor Primária:</span>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: version.corPrimaria }}
                  />
                  <span className="text-muted-foreground">{version.corPrimaria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Cor Secundária:</span>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: version.corSecundaria }}
                  />
                  <span className="text-muted-foreground">{version.corSecundaria}</span>
                </div>
              </div>

              {version.logoUrl && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold">Logo:</span>
                  <span className="text-muted-foreground ml-1">Personalizado</span>
                </div>
              )}

              {version.rodapePersonalizado && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold">Rodapé:</span>
                  <span className="text-muted-foreground ml-1">{version.rodapePersonalizado.substring(0, 50)}...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
