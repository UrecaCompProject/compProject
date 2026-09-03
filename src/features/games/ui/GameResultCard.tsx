import { Button } from '@/shared';

type GameResultCardProps = {
  image: string;
  title: string;
  description: string;
  closeLabel?: string;
  onClose?: () => void;
};

export default function GameResultCard({
  image,
  title,
  description,
  closeLabel = '확인',
  onClose,
}: GameResultCardProps) {
  return (
    // 게임 설명(GameRulesCard) 화면과 캐릭터·타이틀·버튼 위치를 맞춰 전환 시 레이아웃이 흔들리지 않도록 한다
    <div className="flex flex-col items-center h-full px-10 py-5 text-center">
      <div className="relative flex h-50 w-50 shrink-0 items-center justify-center">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-compare-selected/30 blur-[60px]" />
        <img src={image} alt="" className="z-10 h-full w-full object-contain" />
      </div>

      <div className="mt-7.5">
        <h3 className="text-[20px] font-bold text-fg-primary">{title}</h3>
        <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
          {description}
        </p>
      </div>

      <div className="flex w-full mt-auto">
        <Button className="flex-1" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
