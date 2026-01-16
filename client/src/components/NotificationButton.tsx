import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/hooks/useNotification";

export function NotificationButton() {
  const notification = useNotification();
  const [checking, setChecking] = useState(false);

  const checkAllMutation = trpc.notifications.checkAll.useMutation({
    onSuccess: (result) => {
      if (result.total === 0) {
        notification.success("Tudo em ordem! Nenhuma notificação pendente.");
      } else {
        const msg = `${result.total} notificação(ões): ${result.incompleteAnalyses} análise(s) incompleta(s), ${result.okrsAtRisk} OKR(s) em risco`;
        notification.info(msg);
      }
      setChecking(false);
    },
    onError: (error) => {
      notification.error(`Erro ao verificar notificações: ${error.message}`);
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
