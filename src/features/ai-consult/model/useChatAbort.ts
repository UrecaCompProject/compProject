import { useCallback, useRef } from 'react';

export interface UseChatAbortDeps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChatAbort {
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
  handleStop: () => void;
}

export function useChatAbort({ setIsLoading }: UseChatAbortDeps): ChatAbort {
  const abortControllerRef = useRef<AbortController | null>(null);

  const startRequest = useCallback(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  const clearRequest = useCallback((signal?: AbortSignal) => {
    if (signal && abortControllerRef.current?.signal !== signal) return;
    abortControllerRef.current = null;
  }, []);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, [setIsLoading]);

  return { startRequest, clearRequest, handleStop };
}
