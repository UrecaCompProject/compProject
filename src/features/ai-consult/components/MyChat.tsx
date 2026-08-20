export default function MyChat({ sentence }: { sentence: string }) {
  return (
    <div className="w-fit self-end rounded-2xl rounded-tr-sm px-4 py-3 bg-brand-promo-primary max-w-[70%] text-white whitespace-pre-line">
      {sentence}
    </div>
  );
}
