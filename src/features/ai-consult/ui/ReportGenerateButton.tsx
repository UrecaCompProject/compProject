import { Button } from '@/shared';

interface ReportGenerateButtonProps {
  onGenerate: () => void;
  isLoading?: boolean;
  isGeneratingReport?: boolean;
  visible?: boolean;
}

// 5회 AI 응답 후 리포트 생성 버튼을 독립 렌더링, 응답 로딩 중이거나
// 스크롤이 아래로 내려가 있을 때는 페이드 아웃
export default function ReportGenerateButton({
  onGenerate,
  isLoading = false,
  isGeneratingReport = false,
  visible = true,
}: ReportGenerateButtonProps) {
  return (
    <div
      className={`w-fit absolute bottom-full left-1/2 -top-14 -translate-x-1/2 border-border transition-all duration-300 ease-out ${
        isLoading || !visible
          ? 'opacity-0 translate-y-2 pointer-events-none'
          : 'opacity-100 translate-y-0'
      }`}
    >
      <Button
        variant="outline"
        size="md"
        round
        onClick={onGenerate}
        disabled={isLoading}
      >
        {isGeneratingReport ? '리포트 생성 중...' : '리포트 생성'}
      </Button>
    </div>
  );
}
