import CardMatchGame from './components/CardMatchGame';
import { default as ReactionTimeGame } from './components/ReactionTimeGame';
import ScratchGame from './components/ScratchGame';

import type { GameDefinition, GameId } from './types';

export const GAME_REGISTRY: Record<GameId, GameDefinition> = {
  'card-match': {
    title: '카드 뒤집기',
    component: CardMatchGame,
  },
  scratch: {
    title: '스크래치 이벤트',
    component: ScratchGame,
  },
  'reaction-time': {
    title: '반응속도 게임',
    component: ReactionTimeGame,
  },
};

export function isGameId(id: string): id is GameId {
  return Object.prototype.hasOwnProperty.call(GAME_REGISTRY, id);
}
