import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function NotificationButton() {
  const [checking, setChecking] = useState(false);

  const checkAllMutation = trpc.notifications.checkAll.useMutation({
    onSuccess: (result) => {
      if (result.total === 0) {
        alert("✅ Tudo em ordem! Nenhuma notificação pendente.");
      } else {
        alert(
          `🔔 ${result.total} notificação(ões) enviada(s):\n\n` +
          `• ${result.incompleteAnalyses} análise(s) incompleta(s)\n` +
          `• ${result.okrsAtRisk} OKR(s) em risco\n\n` +
          `Verifique suas notificações do sistema.`
        );
      }
      setChecking(false);
    },
    onError: (error) => {
      alert(`❌ Erro ao verificar notificações: ${error.message}`);
      setChecking(false);
    },
  });

  const handleCheck = () => {
    setChecking(true);
    checkAllMutation.mutate();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleCheck}
      disabled={checking}
    >
      <Bell className="mr-2 h-4 w-4" />
      {checking ? "Verificando..." : "Verificar Alertas"}
    </Button>
  );
}
