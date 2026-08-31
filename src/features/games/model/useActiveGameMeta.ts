import { useGameStore } from '../model/useGameStore';
import { GAME_REGISTRY } from '../registry';

export function useActiveGameMeta() {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const revealed = useGameStore((state) => state.revealed);
  const source = useGameStore((state) => state.source);
  const closeGame = useGameStore((state) => state.closeGame);
  const backOverride = useGameStore((state) => state.backOverride);

  if (!activeGameId || !revealed) return null;

  const game = GAME_REGISTRY[activeGameId];
  return { title: game.title, source, onBack: backOverride ?? closeGame };
}
