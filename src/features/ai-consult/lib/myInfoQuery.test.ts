import { describe, it, expect } from 'vitest';

import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { buildMyInfoAnswer, detectMyInfoIntent } from './myInfoQuery';

describe('detectMyInfoIntent', () => {
  it('본인 요금제 질문을 plan으로 감지', () => {
    expect(detectMyInfoIntent('내 요금제 뭐야?')).toBe('plan');
    expect(detectMyInfoIntent('지금 무슨 요금제 쓰고 있어')).toBe('plan');
    expect(detectMyInfoIntent('현재 요금제 알려줘')).toBe('plan');
  });

  it('본인 배지 질문을 badge로 감지', () => {
    expect(detectMyInfoIntent('게임 배지 몇 개야?')).toBe('badge');
    expect(detectMyInfoIntent('내 포인트 얼마나 있어')).toBe('badge');
  });

  it('타인의 요금제를 물으면 thirdParty', () => {
    expect(detectMyInfoIntent('친구 요금제 뭐야')).toBe('thirdParty');
    expect(detectMyInfoIntent('엄마가 쓰는 요금제 알려줘')).toBe('thirdParty');
  });

  it('민감정보를 물으면 sensitive', () => {
    expect(detectMyInfoIntent('내 요금제 결제 카드번호 뭐야')).toBe(
      'sensitive',
    );
  });

  it('관련 없는 질문은 null', () => {
    expect(detectMyInfoIntent('5만원대 요금제 추천해줘')).toBeNull();
    expect(detectMyInfoIntent('안녕하세요')).toBeNull();
  });
});

describe('buildMyInfoAnswer', () => {
  const plan: RecommendedPlan = {
    planId: 'p1',
    planName: '5G 스탠다드',
    reason: '',
    savingAmount: 0,
    monthlyFee: 59000,
    data: '110GB',
  };

  it('로그인하지 않았으면 로그인을 안내', () => {
    const { sentence } = buildMyInfoAnswer('plan', {
      isLoggedIn: false,
      currentPlan: null,
      badgeBalance: 0,
    });
    expect(sentence).toContain('로그인');
  });

  it('요금제 정보를 문장으로 안내', () => {
    const { sentence } = buildMyInfoAnswer('plan', {
      isLoggedIn: true,
      currentPlan: plan,
      badgeBalance: 0,
    });
    expect(sentence).toContain('5G 스탠다드');
    expect(sentence).toContain('59,000원');
    expect(sentence).toContain('110GB');
  });

  it('배지 개수를 안내', () => {
    const { sentence } = buildMyInfoAnswer('badge', {
      isLoggedIn: true,
      currentPlan: null,
      badgeBalance: 1234,
    });
    expect(sentence).toContain('1,234개');
  });

  it('타인 정보 요청은 거절', () => {
    const { sentence } = buildMyInfoAnswer('thirdParty', {
      isLoggedIn: true,
      currentPlan: plan,
      badgeBalance: 0,
    });
    expect(sentence).toContain('다른 분의 정보는 알려드릴 수 없어요');
  });

  it('민감정보 요청은 거절', () => {
    const { sentence } = buildMyInfoAnswer('sensitive', {
      isLoggedIn: true,
      currentPlan: plan,
      badgeBalance: 0,
    });
    expect(sentence).toContain('알려드릴 수 없어요');
  });
});
