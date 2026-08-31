import { Button, useModalStore } from '@/shared';
import badgeImage from '@/shared/assets/images/badge.svg';

type GetBadgeModalProps = {
  badgeCount: number;
};

export default function GetBadgeModal({ badgeCount }: GetBadgeModalProps) {
  const closeModal = useModalStore((state) => state.close);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-promo-soft">
        <img src={badgeImage} alt="" className="h-12 w-12" />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="text-title text-fg-primary">축하합니다!</h2>
        <p className="text-caption text-fg-tertiary">
          배지 {badgeCount}개를 획득하셨습니다
        </p>
      </div>

      <Button type="button" className="w-full" onClick={closeModal}>
        확인
      </Button>
    </div>
  );
}
