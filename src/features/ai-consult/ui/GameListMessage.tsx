import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';

import { Button, Card } from '@/shared';

import { GAME_LIST } from '../constants/gameList';

import type { ChatGameId, SheetGameId } from '../constants/gameList';
import type { LucideIcon } from 'lucide-react';

interface GameListMessageProps {
  onSelectGame: (gameId: ChatGameId | SheetGameId) => void;
  onClose?: () => void;
}

// lucide-react 아이콘을 이름으로 동적 참조
function getIcon(name: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return Icon ?? LucideIcons.Gamepad2;
}

export default function GameListMessage({
  onSelectGame,
  onClose,
}: GameListMessageProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative">
        <div className="text-medium-14-130 text-fg-secondary pr-7">
          원하는 게임을 선택해 주세요!
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="게임 선택창 닫기"
            className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-fg-tertiary hover:bg-surface-pressed hover:text-fg-primary"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {GAME_LIST.map((game) => {
        const Icon = getIcon(game.icon);
        return (
          <Card
            key={game.id}
            border="default"
            gap="none"
            className="flex-row items-center gap-3 p-3.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
              <Icon size={22} />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="text-semibold-14-130 text-fg-primary">
                {game.title}
              </div>
              <div className="text-medium-12-130 text-fg-tertiary">
                {game.description}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              round
              onClick={() => onSelectGame(game.id)}
            >
              시작
            </Button>
          </Card>
        );
      })}
      {onClose && (
        <Button
          variant="outline"
          size="sm"
          round
          className="self-center mt-1"
          onClick={onClose}
        >
          메뉴로 돌아가기
        </Button>
      )}
    </div>
  );
}
