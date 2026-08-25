import type { ReactNode } from 'react';

import { GAME_REGISTRY } from '../registry';
import { useGameStore } from '../store/useGameStore';

type GameLayerProps = {
  children: ReactNode;
};

export default function GameLayer({ children }: GameLayerProps) {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const revealed = useGameStore((state) => state.revealed);
  const params = useGameStore((state) => state.params);
  const closeGame = useGameStore((state) => state.closeGame);

  const game = activeGameId ? GAME_REGISTRY[activeGameId] : null;
  const GameComponent = game?.component;

  return (
    <div className="relative h-full">
      <div className={`h-full ${revealed ? 'z-0' : 'z-10'}`}>{children}</div>

      {GameComponent && (
        <div
          className={`
            absolute inset-0 h-full overflow-y-auto bg-surface-card
            transition-opacity duration-300
            ${revealed ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'}
          `}
        >
          <GameComponent
            reward={params.reward}
            onWin={params.onWin}
            onClose={closeGame}
          />
        </div>
      )}
    </div>
  );
}
