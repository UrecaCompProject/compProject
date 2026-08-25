import { GAME_REGISTRY } from '../registry';
import { useGameStore } from '../store/useGameStore';

export function useActiveGameMeta() {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const revealed = useGameStore((state) => state.revealed);
  const closeGame = useGameStore((state) => state.closeGame);
  const backOverride = useGameStore((state) => state.backOverride);

  if (!activeGameId || !revealed) return null;

  const game = GAME_REGISTRY[activeGameId];
  return { title: game.title, onBack: backOverride ?? closeGame };
}
