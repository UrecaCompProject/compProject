export { default as GameLayer } from './components/GameLayer';

export { default as CardMatchGame } from './components/game/CardMatchGame';
export { default as GameResultCard } from './components/GameResultCard';
export { default as GameRulesCard } from './components/GameRulesCard';
export { default as GameShell } from './components/GameShell';
export { default as ScratchGame } from './components/game/ScratchGame';
// export { default as CardMatchGame } from './components/CardMatchGame';
// export { default as ReactionTimeGame } from './components/ReactionTimeGame';

export { GAME_REGISTRY, isGameId } from './registry';
export { useGameStore } from './store/useGameStore';
export { useActiveGameMeta } from './hooks/useActiveGameMeta';

export {
  CARD_MATCH_RULES,
  ATTENDANCE_RULES,
  REACTION_RULES,
} from './mocks/rules';

export type {
  GameId,
  GameComponentProps,
  GameDefinition,
  GamePhase,
  GameRuleStep,
  GameRuleContent,
} from './types';
export type { GameOpenParams } from './store/useGameStore';
