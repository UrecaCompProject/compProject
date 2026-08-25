import { create } from 'zustand';

import type { GameId } from '../types';

export type GameOpenParams = {
  reward?: number;
  onWin?: (reward: number) => void;
};

const REVEAL_DELAY = 500;

interface GameState {
  activeGameId: GameId | null;
  revealed: boolean;
  params: GameOpenParams;
  openGame: (gameId: GameId, params?: GameOpenParams) => void;
  closeGame: () => void;
}

let revealTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>((set) => ({
  activeGameId: null,
  revealed: false,
  params: {},
  openGame: (gameId, params = {}) => {
    if (revealTimer) clearTimeout(revealTimer);
    set({ activeGameId: gameId, params, revealed: false });
    revealTimer = setTimeout(() => set({ revealed: true }), REVEAL_DELAY);
  },
  closeGame: () => {
    if (revealTimer) clearTimeout(revealTimer);
    set({ activeGameId: null, params: {}, revealed: false });
  },
}));
