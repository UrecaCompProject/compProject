type QuestionProps = {
  question: string;
};

export default function Question({ question }: QuestionProps) {
  return (
    <p className="flex text-caption leading-6  text-fg-primary">
      <span className="shrink-0 font-semibold text-brand-promo-primary">
        Q.
      </span>
      <span className="ml-1 min-w-0">{question}</span>
    </p>
  );
}
