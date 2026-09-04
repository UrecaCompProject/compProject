type QuestionProps = {
  question: string;
};

export default function Question({ question }: QuestionProps) {
  return (
    <p className="flex  font-semibold text-[16px] leading-6  text-fg-primary">
      <span className="shrink-0 text-brand-promo-primary text-[18px]">Q.</span>
      <span className="ml-1.25 mb-1 min-w-0">{question}</span>
    </p>
  );
}
