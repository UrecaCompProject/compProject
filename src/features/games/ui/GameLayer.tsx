import type { ReactNode } from 'react';

import { useGameStore } from '../model/useGameStore';
import { GAME_REGISTRY } from '../registry';

type GameLayerProps = {
  children?: ReactNode;
};

// BottomSheet 내부에서 게임 컴포넌트를 렌더링.
// activeGameId가 있으면 게임을, 없으면 children을 표시.
export default function GameLayer({ children }: GameLayerProps) {
  const activeGameId = useGameStore((state) => state.activeGameId);
  const params = useGameStore((state) => state.params);
  const closeGame = useGameStore((state) => state.closeGame);

  const game = activeGameId ? GAME_REGISTRY[activeGameId] : null;
  const GameComponent = game?.component;

  if (GameComponent) {
    return (
      <GameComponent
        reward={params.reward}
        onWin={params.onWin}
        onClose={closeGame}
      />
    );
  }

  return <>{children}</>;
}
