import { ChevronRight } from 'lucide-react';

import badgeImage from '@/assets/images/badge.png';

const days = ['월', '화', '수', '목', '금', '토', '일'];

export default function CheckIn() {
  return (
    <section className="bg-surface-card px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body- font-bold text-fg-primary">
          연속 출석 <span className="text-brand-promo-primary">11일째</span>
        </h2>

        <button
          type="button"
          className="inline-flex items-center text-regular-12-130 text-fg-tertiary"
        >
          출석 체크
          <ChevronRight size={12} />
        </button>
      </div>

      <ol className="mx-auto flex w-full min-w-[350px] max-w-[390px] items-start justify-between">
        {days.map((day, index) => {
          const checked = index === 0;

          return (
            <li
              key={day}
              aria-label={`${day}요일 ${checked ? '출석 완료' : '미출석'}`}
              className="flex w-8 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-1 ${
                  checked
                    ? 'border-border-brand bg-brand-promo-soft'
                    : 'border-border bg-surface-pressed'
                }`}
              >
                {checked && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-reward-locked">
                    <img
                      src={badgeImage}
                      alt=""
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                )}
              </span>
              <span
                className={`text-medium-12-130 ${
                  checked ? ' text-brand-promo-primary' : 'text-fg-tertiary'
                }`}
              >
                {day}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
