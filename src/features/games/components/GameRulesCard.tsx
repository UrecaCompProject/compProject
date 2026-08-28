import { Button } from '@/features/shared';

import type { GameRuleContent } from '../types';

type GameRulesCardProps = GameRuleContent & {
  onStart: () => void;
};

export default function GameRulesCard({
  image,
  title,
  subtitle,
  steps,
  ctaLabel,
  onStart,
}: GameRulesCardProps) {
  return (
    <div className="flex flex-col items-center h-full px-10 py-5 text-center">
      <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
        <div
          className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
          style={{ backgroundColor: 'rgba(91, 127, 224, 0.3)' }}
        />
        <img
          src={image}
          alt=""
          className="relative z-10 h-[200px] w-[200px] object-contain"
        />
      </div>

      <div className="mt-[30px]">
        <h3 className="text-[20px] font-bold text-fg-primary">{title}</h3>
        <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
          {subtitle}
        </p>
      </div>

      <ol className="mt-[30px] flex w-full flex-col items-start text-left">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col w-full">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-pressed text-[14px] font-semibold text-fg-secondary">
                {index + 1}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-fg-secondary">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-fg-tertiary">
                  {step.description}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="my-2 ml-3 h-[30px] w-[2px] rounded-[10px] bg-surface-pressed" />
            )}
          </li>
        ))}
      </ol>

      <Button className="mt-[60px] w-full" size="lg" onClick={onStart}>
        {ctaLabel}
      </Button>
    </div>
  );
}
