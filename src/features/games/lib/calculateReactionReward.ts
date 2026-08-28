export type EarnedBadgeCount = 1 | 3 | 5;

const TARGET_TIME_MS = 10_000;
const FIVE_BADGE_TOLERANCE_MS = 100;
const THREE_BADGE_TOLERANCE_MS = 500;

export function calculateReactionReward(
  elapsedTimeMs: number,
): EarnedBadgeCount {
  const differenceMs = Math.abs(elapsedTimeMs - TARGET_TIME_MS);

  if (differenceMs <= FIVE_BADGE_TOLERANCE_MS) {
    return 5;
  }

  if (differenceMs <= THREE_BADGE_TOLERANCE_MS) {
    return 3;
  }

  return 1;
}
