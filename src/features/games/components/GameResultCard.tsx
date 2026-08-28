import { Button } from '@/features/shared';

type GameResultCardProps = {
  image: string;
  title: string;
  description: string;
  rewardCount?: number;
  retryLabel?: string;
  closeLabel?: string;
  onRetry: () => void;
  onClose?: () => void;
};

export default function GameResultCard({
  image,
  title,
  description,
  rewardCount,
  retryLabel = '다시 하기',
  closeLabel = '닫기',
  onRetry,
  onClose,
}: GameResultCardProps) {
  return (
    <div className="flex flex-col items-center h-full px-10 pt-10 pb-6 text-center">
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
          {description}
        </p>
      </div>

      {rewardCount !== undefined && (
        <p className="mt-3 font-semibold text-body text-brand-promo-primary">
          배지 {rewardCount}개 획득!
        </p>
      )}

      <div className="flex w-full gap-2 mt-auto">
        <Button variant="secondary" className="flex-1" onClick={onRetry}>
          {retryLabel}
        </Button>
        <Button className="flex-1" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
