import type { ReactNode } from 'react';

import { ChevronLeft } from 'lucide-react';

import { useGameStore } from '../model/useGameStore';
import { GAME_REGISTRY } from '../registry';

type GameLayerProps = {
  children: ReactNode;
};

export default function GameLayer({ children }: GameLayerProps) {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const revealed = useGameStore((state) => state.revealed);
  const params = useGameStore((state) => state.params);
  const closeGame = useGameStore((state) => state.closeGame);
  const backOverride = useGameStore((state) => state.backOverride);

  const game = activeGameId ? GAME_REGISTRY[activeGameId] : null;
  const GameComponent = game?.component;
  const onBack = backOverride ?? closeGame;

  return (
    <div className="relative h-full">
      <div className={`h-full overflow-y-auto ${revealed ? 'z-0' : 'z-10'}`}>
        {children}
      </div>

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
          {revealed && (
            <button
              type="button"
              onClick={onBack}
              aria-label="뒤로 가기"
              className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-fg-primary shadow-shadow hover:bg-surface-pressed"
            >
              <ChevronLeft size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
