import { create } from 'zustand';

import type { GameId } from '../types';

export type GameOpenParams = {
  reward?: number;
};

const REVEAL_DELAY = 500;

interface GameState {
  activeGameId: GameId | null;
  revealed: boolean;
  params: GameOpenParams;

  backOverride: (() => void) | null;
  openGame: (gameId: GameId, params?: GameOpenParams) => void;
  closeGame: () => void;
  setBackOverride: (override: (() => void) | null) => void;
}

let revealTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>((set) => ({
  activeGameId: null,
  revealed: false,
  params: {},
  backOverride: null,
  openGame: (gameId, params = {}) => {
    if (revealTimer) clearTimeout(revealTimer);
    set({ activeGameId: gameId, params, revealed: false, backOverride: null });
    revealTimer = setTimeout(() => set({ revealed: true }), REVEAL_DELAY);
  },
  closeGame: () => {
    if (revealTimer) clearTimeout(revealTimer);
    set({
      activeGameId: null,
      params: {},
      revealed: false,
      backOverride: null,
    });
  },
  setBackOverride: (override) => set({ backOverride: override }),
}));
