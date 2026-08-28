import { useEffect, useState } from 'react';

// 절대 시각(deadline)을 기준으로 잔여 시간을 계산한다. setTimeout 자체는 백그라운드
// 탭에서 브라우저가 임의로 지연/일시정지시킬 수 있어, 매 tick마다 실제 시각과의
// 차이로 다시 계산하고 탭이 보일 때(visibilitychange)도 즉시 재계산해 보정한다.
export function useCountdown(fallbackSeconds: number) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isRunning = deadline !== null;
  const remainingSeconds = isRunning
    ? Math.max(0, Math.ceil((deadline - now) / 1000))
    : fallbackSeconds;
  const isExpired = isRunning && remainingSeconds <= 0;

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  const start = (durationSeconds: number = fallbackSeconds) => {
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadline(startedAt + durationSeconds * 1000);
  };

  return { remainingSeconds, isExpired, start };
}
