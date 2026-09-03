import { Button } from '@/shared';

interface PlanDetailFooterProps {
  onSubscribe: () => void;
  // 비교 대상이 없는 화면(예: 레포트 상세)에서는 onCompare를 넘기지 않아
  // "비교하기" 버튼 자체를 숨긴다.
  onCompare?: () => void;
  compareDisabled?: boolean;
}

// 요금제 상세 시트 하단의 "비교하기/신청하기" 버튼 줄 — PlanQuickSheet, 채팅 추천
// 카드 상세, 레포트 상세의 요금제 조회 화면이 모두 이 컴포넌트 하나를 공유한다.
export default function PlanDetailFooter({
  onSubscribe,
  onCompare,
  compareDisabled,
}: PlanDetailFooterProps) {
  return (
    <div className="flex w-full gap-2">
      {onCompare && (
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={onCompare}
          disabled={compareDisabled}
        >
          비교 하기
        </Button>
      )}
      <Button
        variant="primary"
        size="md"
        className="flex-1"
        onClick={onSubscribe}
      >
        신청 하기
      </Button>
    </div>
  );
}
