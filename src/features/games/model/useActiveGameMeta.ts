import { useEffect } from 'react';

import { GAME_REGISTRY } from '../registry';

import { useGameStore } from './useGameStore';

const REVEAL_DELAY = 500;

export function useActiveGameMeta() {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const revealed = useGameStore((state) => state.revealed);
  const source = useGameStore((state) => state.source);
  const closeGame = useGameStore((state) => state.closeGame);
  const backOverride = useGameStore((state) => state.backOverride);

  useEffect(() => {
    if (!activeGameId) return;

    const timer = setTimeout(
      () => useGameStore.getState().setRevealed(true),
      REVEAL_DELAY,
    );
    return () => clearTimeout(timer);
  }, [activeGameId]);

  if (!activeGameId || !revealed) return null;

  const game = GAME_REGISTRY[activeGameId];
  return { title: game.title, source, onBack: backOverride ?? closeGame };
}
