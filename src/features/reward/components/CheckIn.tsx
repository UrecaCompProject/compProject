import { useState } from 'react';

import { ChevronRight } from 'lucide-react';

import badgeImage from '@/assets/images/badge.png';
import { Button, useModalStore } from '@/features/shared';

const days = ['월', '화', '수', '목', '금', '토', '일'];
const todayIndex = (new Date().getDay() + 6) % 7;

export default function CheckIn() {
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const openModal = useModalStore((state) => state.open);
  const closeModal = useModalStore((state) => state.close);

  const handleConfirmCheckIn = () => {
    setIsTodayChecked(true);
    closeModal();
  };

  const handleOpenCheckInModal = () => {
    openModal({
      title: '출석하시겠습니까?',
      content: (
        <p className="text-center text-caption text-fg-secondary">
          이 달의 출석 현황을 확인해보세요
        </p>
      ),
      footer: (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={closeModal}
          >
            취소
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirmCheckIn}
          >
            출석하기
          </Button>
        </div>
      ),
    });
  };

  return (
    <section className="bg-surface-card px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body font-bold text-fg-primary">
          연속 출석{' '}
          <span className="text-brand-promo-primary">
            {isTodayChecked ? 12 : 11}일째
          </span>
        </h2>

        <button
          type="button"
          onClick={handleOpenCheckInModal}
          disabled={isTodayChecked}
          className="inline-flex items-center text-regular-12-130 text-fg-tertiary disabled:text-fg-disabled"
        >
          {isTodayChecked ? '출석 완료' : '출석 체크'}
          {!isTodayChecked && <ChevronRight size={12} />}
        </button>
      </div>

      <ol className="mx-auto flex w-full min-w-[350px] max-w-[390px] items-start justify-between">
        {days.map((day, index) => {
          const checked =
            index === 0 || (index === todayIndex && isTodayChecked);

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
