import { create } from 'zustand';

import type { GameId } from '../types';

// 게임을 어디서 시작했는지 — 끝났을 때 어느 바텀시트로 돌아갈지 결정한다.
// 'chat': 채팅 퀵리플라이로 시작 -> ChatPage의 전용 게임 시트에서 진행, 끝나면 채팅으로.
// 'reward': 혜택/이벤트 미션 목록에서 시작 -> RewardSheet 안에서 진행, 끝나면 미션 목록으로.
export type GameSource = 'chat' | 'reward';

export type GameOpenParams = {
  reward?: number;
  onWin?: (reward: number) => void;
  source?: GameSource;
};

interface GameState {
  activeGameId: GameId | null;
  revealed: boolean;
  params: GameOpenParams;
  source: GameSource;
  backOverride: (() => void) | null;
  openGame: (gameId: GameId, params?: GameOpenParams) => void;
  closeGame: () => void;
  setRevealed: (revealed: boolean) => void;
  setBackOverride: (override: (() => void) | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  activeGameId: null,
  revealed: false,
  params: {},
  source: 'chat',
  backOverride: null,
  openGame: (gameId, params = {}) => {
    set({
      activeGameId: gameId,
      params,
      source: params.source ?? 'chat',
      revealed: false,
      backOverride: null,
    });
  },
  closeGame: () => {
    set({
      activeGameId: null,
      params: {},
      source: 'chat',
      revealed: false,
      backOverride: null,
    });
  },
  setRevealed: (revealed) => set({ revealed }),
  setBackOverride: (override) => set({ backOverride: override }),
}));
