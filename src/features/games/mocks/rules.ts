import introImage from '@/assets/images/card-match-intro.svg';
import rouletteImage from '@/assets/images/roulette-game-intro.svg';
import speedImage from '@/assets/images/speed-game-intro.svg';

import type { GameRuleContent } from '../types';

// 카드 뒤집기 게임 시작 전 안내 (GameRulesCard)
export const CARD_MATCH_RULES: GameRuleContent = {
  image: introImage,
  title: '카드 뒤집기',
  subtitle: '같은 그림의 짝을 모두 찾아보세요',
  steps: [
    {
      title: '같은 그림의 카드 2장을 찾아보세요!',
      description: '카드를 뒤집어 같은 그림의 짝을 맞춰보세요.',
    },
    {
      title: '같은 카드라면 매칭 성공!',
      description:
        '짝이 맞은 카드는 열린 상태로 유지되고, 다른 카드라면 다시 뒤집힙니다.',
    },
    {
      title: '제한 시간 안에 모든 짝을 맞춰보세요!',
      description: '빠르게 모든 카드를 맞추고 미션을 완료해보세요.',
    },
  ],
  ctaLabel: '게임 시작',
};

// 출석 룰렛 게임 시작 전 안내 (GameRulesCard)
export const ATTENDANCE_RULES: GameRuleContent = {
  image: rouletteImage,
  title: '출석 룰렛',
  subtitle: '출석하고 룰렛을 돌려 오늘의 혜택을 받아보세요',
  steps: [
    {
      title: '오늘의 출석을 완료해보세요!',
      description: '하루 한 번 출석하고 룰렛 기회를 받아보세요.',
    },
    {
      title: '룰렛을 돌려보세요!',
      description: '버튼을 눌러 룰렛을 돌리고 결과를 확인해보세요.',
    },
    {
      title: '오늘의 혜택을 받아보세요!',
      description: '룰렛 결과에 따라 다양한 혜택을 받아보세요.',
    },
  ],
  ctaLabel: '게임 시작',
};

// 반응속도 탭 게임 시작 전 안내 (GameRulesCard)
export const REACTION_RULES: GameRuleContent = {
  image: speedImage,
  title: '반응속도 탭 게임',
  subtitle: '가장 10초에 가까운 타이밍에 탭해보세요',
  steps: [
    {
      title: '화면의 타이머를 주시하세요!',
      description: '타이머가 10초에 가까워질 때 탭해보세요.',
    },
    {
      title: '타이밍이 정확하다면 성공!',
      description: '10초에 가장 가까운 타이밍에 탭하면 성공입니다.',
    },
    {
      title: '제한 시간 안에 도전해보세요!',
      description:
        '구간별로 뱃지 수가 다르게 지급되니, 제한 시간 안에 도전해보세요.',
    },
  ],
  ctaLabel: '게임 시작',
};
