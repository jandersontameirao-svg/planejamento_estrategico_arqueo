import { useEffect, useRef, useState } from "react";

interface UseAutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
}

export function useAutoSave(data: any, options: UseAutoSaveOptions) {
  const { delay = 2000, onSave } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    setError(null);
    setHasChanges(true);

    // Definir novo timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        setLastSaved(new Date());
        setIsSaving(false);
        setHasChanges(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar");
        setIsSaving(false);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave]);

  return {
    isSaving,
    lastSaved,
    error,
    hasChanges,
  };
}
