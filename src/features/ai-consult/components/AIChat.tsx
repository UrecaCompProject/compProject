export default function AIChat({ sentence }: { sentence: string }) {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300"></div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 mt-2 bg-surface-card max-w-[70%] whitespace-pre-line">
        {sentence}
      </div>
    </div>
  );
}
