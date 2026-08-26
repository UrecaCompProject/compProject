type QuestionProps = {
  number: number;
  question: string;
};

export default function Question({ number, question }: QuestionProps) {
  return (
    <p className="text-[14px] leading-6 text-fg-primary">
      <span className="font-semibold">Q{number}.</span> {question}
    </p>
  );
}
