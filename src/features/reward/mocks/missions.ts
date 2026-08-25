import type { Mission } from '../types';

export const missions: Mission[] = [
  {
    id: 'card-match',
    title: '카드 맞추기',
    reward: 5,
    actionLabel: '시작',
    icon: 'card',
  },
  {
    id: 'reaction',
    title: '버튼 시간 맞추기',
    reward: 5,
    actionLabel: '시작',
    icon: 'timer',
  },
  {
    id: 'attendance',
    title: '출석 룰렛',
    reward: 5,
    actionLabel: '시작',
    icon: 'roulette',
  },
  {
    id: 'scratch',
    title: '스크래치 이벤트',
    reward: 3,
    actionLabel: '시작',
    icon: 'scratch',
  },
  {
    id: 'security-quiz',
    title: '보안 퀴즈',
    reward: 1,
    actionLabel: '시작',
    icon: 'security',
  },
  {
    id: 'telecom-quiz',
    title: '통신 상식 퀴즈',
    reward: 1,
    actionLabel: '시작',
    icon: 'telecom',
  },
  {
    id: 'friend-share',
    title: '친구 공유',
    reward: 1,
    actionLabel: '공유',
    icon: 'share',
  },
];
