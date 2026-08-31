import { Button } from '@/shared';

interface ReportGenerateButtonProps {
  onGenerate: () => void;
  isLoading?: boolean;
  isGeneratingReport?: boolean;
}

// 요금제 추천이 없는 일반 대화에서 5회 AI 응답 후 리포트 생성 버튼을 독립 렌더링
export default function ReportGenerateButton({
  onGenerate,
  isLoading = false,
  isGeneratingReport = false,
}: ReportGenerateButtonProps) {
  return (
    <div className="mt-3">
      <Button
        variant="secondary"
        size="md"
        className="w-full"
        onClick={onGenerate}
        disabled={isLoading}
      >
        {isGeneratingReport ? '레포트 생성 중...' : '레포트 생성'}
      </Button>
    </div>
  );
}
