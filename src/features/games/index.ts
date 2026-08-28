export { default as GameLayer } from './components/GameLayer';
export { default as CardMatchGame } from './components/CardMatchGame';
export { default as ReactionTimeGame } from './components/ReactionTimeGame';
export { default as ScratchGame } from './components/ScratchGame';

export { GAME_REGISTRY, isGameId } from './registry';
export { useGameStore } from './store/useGameStore';
export { useActiveGameMeta } from './hooks/useActiveGameMeta';

export type { GameId, GameComponentProps, GameDefinition } from './types';
export type { GameOpenParams } from './store/useGameStore';
