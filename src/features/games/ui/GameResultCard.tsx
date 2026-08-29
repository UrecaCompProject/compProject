import { Button } from '@/shared';

type GameResultCardProps = {
  image: string;
  title: string;
  description: string;
  rewardCount?: number;
  closeLabel?: string;
  onClose?: () => void;
};

export default function GameResultCard({
  image,
  title,
  description,
  rewardCount,
  closeLabel = '확인',
  onClose,
}: GameResultCardProps) {
  return (
    <div className="flex flex-col items-center h-full px-10 pt-10 pb-6 text-center">
      <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
        <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-compare-selected/30 blur-[60px]" />
        <img
          src={image}
          alt=""
          className="relative z-10 h-[200px] w-[200px] object-contain"
        />
      </div>

      <div className="mt-[30px]">
        <h3 className="text-[20px] font-bold text-fg-primary">{title}</h3>
        <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
          {description}
        </p>
      </div>

      {rewardCount !== undefined && (
        <p className="mt-3 font-semibold text-body text-brand-promo-primary">
          배지 {rewardCount}개 획득!
        </p>
      )}

      <div className="flex w-full mt-auto">
        <Button className="flex-1" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
