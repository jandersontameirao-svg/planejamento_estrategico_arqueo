import { useState, useEffect, useCallback } from "react";

/**
 * Hook para persistir dados no localStorage
 * Sincroniza automaticamente entre abas/janelas
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage[${key}]:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Erro ao escrever localStorage[${key}]:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook para persistir dados de análises
 */
export function useAnaliseStorage(analiseId: string, initialData: Record<string, any>) {
  const [data, setData] = useLocalStorage(`analise_${analiseId}`, initialData);
  const [isSaved, setIsSaved] = useState(true);

  const updateData = useCallback(
    (newData: Record<string, any>) => {
      setData(newData);
      setIsSaved(false);
      // Simular delay de salvamento
      const timer = setTimeout(() => setIsSaved(true), 500);
      return () => clearTimeout(timer);
    },
    [setData]
  );

  return { data, updateData, isSaved };
}

/**
 * Hook para persistir completude de análises
 */
export function useCompletudeStorage() {
  const [completude, setCompletude] = useLocalStorage("completude_analises", {
    identidade: 100,
    bsc: 0,
    pestel: 0,
    forcas: 0,
    stakeholders: 0,
    vrio: 0,
    swot: 0,
    okr: 0,
  });

  const atualizarCompletude = useCallback(
    (analiseId: string, percentual: number) => {
      setCompletude((prev: any) => ({
        ...prev,
        [analiseId]: Math.min(100, Math.max(0, percentual)),
      }));
    },
    [setCompletude]
  );

  return { completude, atualizarCompletude };
}
