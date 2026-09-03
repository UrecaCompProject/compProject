import { Button, useModalStore } from '@/shared';
import badgeImage from '@/shared/assets/images/badge.svg';

import { useAttendance } from '../model/useAttendance';

import GetBadgeModal from './GetBadgeModal';

const days = ['월', '화', '수', '목', '금', '토', '일'];

export default function CheckIn() {
  const { weekChecks, todayIndex, currentStreak, checkIn, isCheckingIn } =
    useAttendance();
  const isCheckedToday = weekChecks[todayIndex];

  const openModal = useModalStore((state) => state.open);
  const closeModal = useModalStore((state) => state.close);

  const handleConfirmCheckIn = async () => {
    try {
      const { badgeCount } = await checkIn();
      openModal({ content: <GetBadgeModal badgeCount={badgeCount} /> });
    } catch (error) {
      console.error(error);
      closeModal();
    }
  };

  const handleOpenCheckInModal = () => {
    openModal({
      title: '출석하시겠습니까?',
      content: (
        <div className="flex flex-col gap-2 text-center text-body text-fg-tertiary">
          <div className="flex gap-2 mt-2">
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
              disabled={isCheckingIn}
            >
              출석하기
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <section className="px-4 py-4 bg-surface-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-bold">
          연속 출석{' '}
          <span className="text-brand-promo-primary">{currentStreak}일째</span>
        </h2>

        <Button
          type="button"
          variant="primary"
          size="sm"
          className="text-medium-12-130"
          onClick={handleOpenCheckInModal}
          disabled={isCheckedToday}
        >
          {isCheckedToday ? '출석 완료' : '출석체크'}
        </Button>
      </div>

      <ol className="mx-auto flex w-full max-w-105 items-start justify-between">
        {days.map((day, index) => {
          const checked = weekChecks[index];

          return (
            <li
              key={day}
              aria-label={`${day}요일 ${checked ? '출석 완료' : '미출석'}`}
              className="flex flex-col items-center w-8 gap-1.5 shrink-0"
            >
              <span
                className={`inline-flex h-8.5 w-8.5 items-center justify-center rounded-full ${
                  checked
                    ? 'border border-border-brand bg-brand-promo-soft'
                    : 'bg-brand-promo-soft'
                }
                `}
              >
                {checked && (
                  <span className="flex items-center justify-center rounded-full w-7 h-7 bg-reward-locked">
                    <img
                      src={badgeImage}
                      alt=""
                      className="object-contain w-5.5 h-5.5"
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
