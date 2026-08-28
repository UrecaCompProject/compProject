import { Button } from '@/shared';
import correctImage from '@/shared/assets/images/correct.png';
import incorrectImage from '@/shared/assets/images/incorrect.png';

type QuizResultProps = {
  isCorrect: boolean;
  explanation: string;
  actionLabel: string;
  onNext: () => void;
};

export default function QuizResult({
  isCorrect,
  explanation,
  actionLabel,
  onNext,
}: QuizResultProps) {
  return (
    <section
      aria-live="polite"
      className="flex w-full flex-col items-center text-center"
    >
      <img
        src={isCorrect ? correctImage : incorrectImage}
        alt=""
        className="h-14 w-14 object-contain"
      />
      <h3 className="mt-2 text-[16px] font-bold text-fg-primary">
        {isCorrect ? '정답이에요!' : '아쉬워요!'}
      </h3>
      <p className="mt-2 text-[13px] leading-5 text-fg-tertiary">
        {explanation}
      </p>
      <Button className="mt-5 w-full" size="lg" onClick={onNext}>
        {actionLabel}
      </Button>
    </section>
  );
}
