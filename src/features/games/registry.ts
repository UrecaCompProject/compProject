import CardMatchGame from './ui/game/CardMatchGame';
import RuletteGame from './ui/game/RuletteGame';
import ScratchGame from './ui/game/ScratchGame';
import SpeedGame from './ui/game/SpeedGame';

// import CardMatchGame from './components/CardMatchGame';
// import { default as ReactionTimeGame } from './components/ReactionTimeGame';
// import ScratchGame from './components/ScratchGame';

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
  reaction: {
    title: '반응속도 탭 게임',
    component: SpeedGame,
  },
  attendance: {
    title: '출석 룰렛',
    component: RuletteGame,
  },

  //   'reaction-time': {
  //     title: '반응속도 게임',
  //     component: ReactionTimeGame,

  //   },
};

export function isGameId(id: string): id is GameId {
  return Object.prototype.hasOwnProperty.call(GAME_REGISTRY, id);
}
