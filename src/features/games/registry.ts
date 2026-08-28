import CardMatchGame from './components/game/CardMatchGame';
import RuletteGame from './components/game/RuletteGame';
import ScratchGame from './components/game/ScratchGame';
import SpeedGame from './components/game/SpeedGame';

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
};

export function isGameId(id: string): id is GameId {
  return Object.prototype.hasOwnProperty.call(GAME_REGISTRY, id);
}
