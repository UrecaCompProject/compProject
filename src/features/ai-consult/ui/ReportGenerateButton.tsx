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
          inline-flex h-10 cursor-pointer items-center justify-center
          rounded-full border border-border bg-brand-pale px-5
          text-body font-semibold text-brand-secondary shadow-shadow
          transition-colors duration-100
          hover:border-border-strong
          disabled:cursor-not-allowed disabled:text-fg-disabled
        "
      >
        {isGeneratingReport ? '리포트 생성 중...' : '리포트 생성'}
      </button>
    </div>
  );
}
