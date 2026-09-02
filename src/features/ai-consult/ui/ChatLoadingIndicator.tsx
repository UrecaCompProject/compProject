// 로딩 중 표시할 타이핑 인디케이터 — 점 3개가 순서대로 bounce
export default function ChatLoadingIndicator() {
  return (
    <div className="flex gap-2 px-4">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="AI 도우미 해리" />
      </div>
      <div className="shadow-shadow mt-2 flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-card px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-disabled [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-disabled [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-disabled" />
      </div>
    </div>
  );
}
