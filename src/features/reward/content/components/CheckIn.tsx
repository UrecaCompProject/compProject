import { ChevronRight } from 'lucide-react';

import badgeImage from '../../assets/badge.png';

const days = ['일', '월', '화', '수', '목', '금', '토'];

export default function CheckIn() {
  return (
    <section className="bg-surface-card px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-caption font-bold text-fg-primary">
          연속 출석 <span className="text-brand-promo-primary">11일째</span>
        </h2>

        <button
          type="button"
          className="inline-flex items-center text-[10px] text-fg-tertiary"
        >
          출석 체크
          <ChevronRight size={14} />
        </button>
      </div>

      <ol className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const checked = index === 0;

          return (
            <li
              key={day}
              aria-label={`${day}요일 ${checked ? '출석 완료' : '미출석'}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                  checked ? 'bg-brand-promo-soft' : 'bg-surface-pressed'
                }`}
              >
                {checked ? (
                  <img
                    src={badgeImage}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                ) : null}
              </span>
              <span
                className={`text-[10px] ${
                  checked ? 'text-brand-promo-primary' : 'text-fg-tertiary'
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
