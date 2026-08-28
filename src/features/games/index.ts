export { default as GameLayer } from './ui/GameLayer';

export { default as CardMatchGame } from './ui/game/CardMatchGame';
export { default as GameResultCard } from './ui/GameResultCard';
export { default as GameRulesCard } from './ui/GameRulesCard';
export { default as GameShell } from './ui/GameShell';
export { default as ScratchGame } from './ui/game/ScratchGame';
// export { default as CardMatchGame } from './ui/CardMatchGame';
// export { default as ReactionTimeGame } from './ui/ReactionTimeGame';

export { GAME_REGISTRY, isGameId } from './registry';
export { useGameStore } from './model/useGameStore';
export { useActiveGameMeta } from './model/useActiveGameMeta';

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
export type { GameOpenParams } from './model/useGameStore';
