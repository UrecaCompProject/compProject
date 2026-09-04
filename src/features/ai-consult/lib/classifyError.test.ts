import { describe, it, expect } from 'vitest';

import { classifyError } from './classifyError';

describe('classifyError', () => {
  it('네트워크 에러를 network로 분류', () => {
    const result = classifyError(new Error('Failed to fetch'));
    expect(result.type).toBe('network');
    expect(result.userMessage).toContain('인터넷 연결');
  });

  it('NetworkError를 network로 분류', () => {
    const result = classifyError(
      new Error('NetworkError when attempting to fetch'),
    );
    expect(result.type).toBe('network');
  });

  it('타임아웃 에러를 timeout으로 분류', () => {
    const result = classifyError(new Error('Request timeout'));
    expect(result.type).toBe('timeout');
    expect(result.userMessage).toContain('오래 걸리고');
  });

  it('서버 500 에러를 server로 분류', () => {
    const result = classifyError(
      new Error('AI 상담 요청 실패: 500 Internal Server Error'),
    );
    expect(result.type).toBe('server');
    expect(result.userMessage).toContain('일시적인 오류');
  });

  it('리포트 생성 실패를 server로 분류', () => {
    const result = classifyError(
      new Error('리포트 생성 실패: 502 Bad Gateway'),
    );
    expect(result.type).toBe('server');
  });

  it('빈 응답을 empty_response로 분류', () => {
    const result = classifyError(new Error('AI 상담 응답이 비어 있습니다.'));
    expect(result.type).toBe('empty_response');
    expect(result.userMessage).toContain('불러오지 못했어요');
  });

  it('인증 에러를 auth로 분류', () => {
    const result = classifyError(new Error('401 Unauthorized'));
    expect(result.type).toBe('auth');
    expect(result.userMessage).toContain('로그인이 만료');
  });

  it('알 수 없는 에러를 unknown으로 분류', () => {
    const result = classifyError(new Error('Something unexpected'));
    expect(result.type).toBe('unknown');
    expect(result.userMessage).toContain('요청 중 문제');
  });

  it('Error 인스턴스가 아닌 경우 unknown으로 분류', () => {
    const result = classifyError('some string error');
    expect(result.type).toBe('unknown');
  });

  it('모든 분류 결과에 quickReplies가 포함됨', () => {
    const cases = [
      new Error('Failed to fetch'),
      new Error('timeout'),
      new Error('500 error'),
      new Error('AI 상담 응답이 비어 있습니다.'),
      new Error('401 Unauthorized'),
      new Error('unknown error'),
    ];
    for (const err of cases) {
      const result = classifyError(err);
      expect(result.quickReplies.length).toBeGreaterThan(0);
      expect(result.quickReplies).not.toContain('다시 시도');
    }
  });
});
