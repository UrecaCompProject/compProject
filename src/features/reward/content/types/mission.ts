export type MissionIcon =
  'card' | 'timer' | 'roulette' | 'scratch' | 'security' | 'telecom' | 'share';

export type Mission = {
  id: string;
  title: string;
  reward: number;
  actionLabel: '시작' | '공유';
  icon: MissionIcon;
};
