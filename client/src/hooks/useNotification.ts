import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotification() {
  const notify = (
    message: string,
    type: NotificationType = "info",
    options?: NotificationOptions
  ) => {
    const config = {
      duration: options?.duration || 3000,
      action: options?.action,
    };

    switch (type) {
      case "success":
        toast.success(message, config);
        break;
      case "error":
        toast.error(message, config);
        break;
      case "warning":
        toast.warning(message, config);
        break;
      case "info":
      default:
        toast.info(message, config);
        break;
    }
  };

  return {
    success: (message: string, options?: NotificationOptions) =>
      notify(message, "success", options),
    error: (message: string, options?: NotificationOptions) =>
      notify(message, "error", options),
    warning: (message: string, options?: NotificationOptions) =>
      notify(message, "warning", options),
    info: (message: string, options?: NotificationOptions) =>
      notify(message, "info", options),
  };
}
