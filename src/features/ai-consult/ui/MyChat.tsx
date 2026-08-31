export default function MyChat({ sentence }: { sentence: string }) {
  return (
    <div className="w-fit self-end rounded-2xl rounded-tr-sm px-4 py-3 bg-chat-mine text-fg-primary shadow-chat-mine max-w-[70%] whitespace-pre-line">
      {sentence}
    </div>
  );
}
