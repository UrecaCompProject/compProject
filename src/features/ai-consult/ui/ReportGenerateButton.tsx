import { FileText } from 'lucide-react';

interface ReportGenerateButtonProps {
  onGenerate: () => void;
  isLoading?: boolean;
  isGeneratingReport?: boolean;
  visible?: boolean;
}

// 5회 AI 응답 후 리포트 생성 바를 독립 렌더링, 응답 로딩 중이거나
// 스크롤이 아래로 내려가 있을 때는 페이드 아웃
export default function ReportGenerateButton({
  onGenerate,
  isLoading = false,
  isGeneratingReport = false,
  visible = true,
}: ReportGenerateButtonProps) {
  return (
    <div
      className={`absolute bottom-full left-0 flex w-full justify-center px-4 pb-3 pt-2 transition-all duration-300 ease-out ${
        isLoading || !visible
          ? 'pointer-events-none translate-y-2 opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="
          flex h-10 w-fit cursor-pointer items-center justify-center gap-2 px-6
          rounded-full border border-brand-secondary bg-brand-primary
          text-caption font-semibold text-white shadow-float
          transition-colors duration-100
          hover:bg-brand-secondary
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        <FileText size={15} strokeWidth={2.25} />
        {isGeneratingReport ? '리포트 생성 중...' : '상담 리포트 만들기'}
      </button>
    </div>
  );
}
