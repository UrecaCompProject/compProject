import type { ComponentType } from 'react';

/** 등록된 게임 id. registry.ts의 key와 항상 일치해야 함 */
export type GameId = 'card-match' | 'scratch' | 'reaction-time';

export type GameComponentProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export type GameDefinition = {
  title: string;
  component: ComponentType<GameComponentProps>;
};
