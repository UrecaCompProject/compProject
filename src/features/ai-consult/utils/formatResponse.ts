import type { ConsultResponse } from '@/lib/aiConsult';

// Edge Function 응답을 채팅 버블에 표시할 문장으로 변환합니다.
export function formatResponse(response: ConsultResponse): string {
  const parts: string[] = [];
  if (response.notice) parts.push(response.notice);
  if (response.recommendations.length > 0) {
    parts.push('추천 요금제를 알려드릴게요:');
    response.recommendations.forEach((plan, index) => {
      const saving =
        plan.savingAmount > 0
          ? ` (월 ${plan.savingAmount.toLocaleString()}원 절감)`
          : '';
      parts.push(`${index + 1}. ${plan.planName}${saving}\n${plan.reason}`);
    });
  }
  if (parts.length === 0) {
    parts.push(
      '상세 정보를 입력하시면 더 정확한 요금제를 추천해드릴 수 있어요.',
    );
  }
  return parts.join('\n\n');
}
