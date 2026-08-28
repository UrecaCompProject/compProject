type ProgressDotsProps = {
  current: number;
  total: number;
};

export default function ProgressDots({ current, total }: ProgressDotsProps) {
  const dots = Array.from({ length: total });

  return (
    <div
      aria-label={`전체 ${total}문제 중 ${current}번째 문제`}
      className="flex items-center justify-center gap-1.5"
    >
      {dots.map((_, index) => {
        const isActive = index + 1 === current;

        return (
          <span
            key={index}
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-lg ${
              isActive ? 'bg-brand-promo-primary' : 'bg-reward-locked'
            }`}
          />
        );
      })}
    </div>
  );
}
