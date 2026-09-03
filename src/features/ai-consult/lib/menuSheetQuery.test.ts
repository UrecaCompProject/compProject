import { describe, it, expect } from 'vitest';

import { detectMenuSheet } from './menuSheetQuery';

describe('detectMenuSheet', () => {
  it('마이페이지', () => {
    expect(detectMenuSheet('마이페이지 보여줘')).toBe('mypage');
    expect(detectMenuSheet('마이 페이지')).toBe('mypage');
  });

  it('전체 요금제 → 요금제 메뉴', () => {
    expect(detectMenuSheet('전체 요금제 알려줘')).toBe('plan');
    expect(detectMenuSheet('요금제 목록 보여줘')).toBe('plan');
    expect(detectMenuSheet('어떤 요금제들이 있어')).toBe('plan');
  });

  it('혜택·이벤트', () => {
    expect(detectMenuSheet('혜택 이벤트 페이지')).toBe('reward');
    expect(detectMenuSheet('이벤트 페이지 보여줘')).toBe('reward');
    expect(detectMenuSheet('이벤트 보여줘')).toBe('reward');
  });

  it('리포트', () => {
    expect(detectMenuSheet('나 리포트 있나')).toBe('report');
    expect(detectMenuSheet('리포트 보여줘')).toBe('report');
    expect(detectMenuSheet('상담 리포트')).toBe('report');
  });

  it('기존 퀵리플라이/일반 상담은 가로채지 않음', () => {
    expect(detectMenuSheet('요금제 추천받기')).toBeNull();
    expect(detectMenuSheet('요금제 비교하기')).toBeNull();
    expect(detectMenuSheet('요금제 가입하기')).toBeNull();
    expect(detectMenuSheet('이 요금제 혜택 뭐야')).toBeNull();
    expect(detectMenuSheet('5만원대 요금제 추천해줘')).toBeNull();
  });
});
