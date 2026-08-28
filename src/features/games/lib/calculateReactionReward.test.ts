import { describe, expect, it } from 'vitest';

import { calculateReactionReward } from './calculateReactionReward';

describe('calculateReactionReward', () => {
  it.each([9900, 9950, 10000, 10050, 10100])(
    '%dms이면 배지 5개를 반환한다',
    (elapsedTimeMs) => {
      expect(calculateReactionReward(elapsedTimeMs)).toBe(5);
    },
  );

  it.each([9500, 9800, 10200, 10500])(
    '%dms이면 배지 3개를 반환한다',
    (elapsedTimeMs) => {
      expect(calculateReactionReward(elapsedTimeMs)).toBe(3);
    },
  );

  it.each([9499, 10501, 15000])(
    '%dms이면 배지 1개를 반환한다',
    (elapsedTimeMs) => {
      expect(calculateReactionReward(elapsedTimeMs)).toBe(1);
    },
  );
});
