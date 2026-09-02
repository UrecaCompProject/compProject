type QuestionProps = {
  question: string;
};

export default function Question({ question }: QuestionProps) {
  return (
    <p className="flex text-[14px] leading-6 text-fg-primary">
      <span className="shrink-0 font-semibold">Q.</span>
      <span className="ml-1 min-w-0">{question}</span>
    </p>
  );
}
