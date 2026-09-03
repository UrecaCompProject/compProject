import type { Mission } from '../types';

export const missions: Mission[] = [
  {
    id: 'card-match',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f101',
    title: '카드 맞추기',
    reward: 5,
    actionLabel: '시작',
    icon: 'card',
  },
  {
    id: 'reaction',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f102',
    title: '반응속도 탭 게임',
    reward: 5,
    actionLabel: '시작',
    icon: 'timer',
  },
  {
    id: 'attendance',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f103',
    title: '출석 룰렛',
    reward: 5,
    actionLabel: '시작',
    icon: 'roulette',
  },
  {
    id: 'scratch',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f104',
    title: '스크래치 이벤트',
    // 보상은 긁을 때 배지 1~5개 중 랜덤으로 정해진다.
    randomReward: true,
    actionLabel: '시작',
    icon: 'scratch',
  },
  {
    id: 'security-quiz',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f105',
    title: '보안 OX 퀴즈',
    reward: 1,
    actionLabel: '시작',
    icon: 'security',
  },
  {
    id: 'telecom-quiz',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f106',
    title: '통신 상식 퀴즈',
    reward: 1,
    actionLabel: '시작',
    icon: 'telecom',
  },
  {
    id: 'friend-share',
    uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f107',
    title: '친구 공유',
    reward: 1,
    actionLabel: '공유',
    icon: 'share',
  },
];
