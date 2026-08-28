import type { ReactNode } from 'react';

import type { GamePhase } from '../types';

type GameShellProps = {
  phase: GamePhase;
  intro: ReactNode;
  playing: ReactNode;
  result: ReactNode;
};

// intro/playing/result 페이지 구성이 모든 미니게임에서 동일해서,
// 각 게임은 현재 phase만 넘기고 세 화면 내용만 갈아끼우면 된다.
export default function GameShell({
  phase,
  intro,
  playing,
  result,
}: GameShellProps) {
  if (phase === 'intro') return <>{intro}</>;
  if (phase === 'result') return <>{result}</>;
  return <>{playing}</>;
}
