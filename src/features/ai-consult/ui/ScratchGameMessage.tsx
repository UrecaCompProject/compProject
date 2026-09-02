import { ScratchGame } from '@/features/games';

interface ScratchGameMessageProps {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
}

// ScratchGame을 채팅 메시지로 렌더링하기 위한 래퍼
// 기존 ScratchGame 컴포넌트를 그대로 재사용하며 내부 로직은 수정하지 않음
export default function ScratchGameMessage({
  reward,
  onWin,
  onClose,
}: ScratchGameMessageProps) {
  return (
    <div className="flex justify-center py-2 px-4">
      <ScratchGame reward={reward} onWin={onWin} onClose={onClose} />
    </div>
  );
}
