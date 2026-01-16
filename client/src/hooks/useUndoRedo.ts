import { useState, useCallback, useEffect } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Atualizar estado presente
  const updatePresent = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const nextPresent = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState.present)
        : newState;

      // Se o novo estado é igual ao presente, não fazer nada
      if (JSON.stringify(nextPresent) === JSON.stringify(prevState.present)) {
        return prevState;
      }

      return {
        past: [...prevState.past, prevState.present],
        present: nextPresent,
        future: [], // Limpar future quando há uma nova ação
      };
    });
  }, []);

  // Desfazer (Undo)
  const undo = useCallback(() => {
    setState((prevState) => {
      if (prevState.past.length === 0) return prevState;

      const newPast = [...prevState.past];
      const newPresent = newPast.pop()!;

      return {
        past: newPast,
        present: newPresent,
        future: [prevState.present, ...prevState.future],
      };
    });
  }, []);

  // Refazer (Redo)
  const redo = useCallback(() => {
    setState((prevState) => {
      if (prevState.future.length === 0) return prevState;

      const newFuture = [...prevState.future];
      const newPresent = newFuture.shift()!;

      return {
        past: [...prevState.past, prevState.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  // Resetar histórico
  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: state.present,
    setState: updatePresent,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
