import { lazy, Suspense } from 'react';

import loadingAnimation from '@/assets/images/loading.json';

import { getLottiePlayerPromise } from '../utils/preloadLottie';

// Lottie Player는 ~450KB 라이브러리이므로 dynamic import로 별도 청크 분리
// preloadLottiePlayer()가 먼저 호출되었다면 이미 캐시된 promise를 재사용
const Player = lazy(() =>
  getLottiePlayerPromise().then((mod) => ({ default: mod.Player })),
);

// 로딩 중 표시할 Lottie 애니메이션 — 3개 원이 위아래로 bounce하는 pingpong
export default function ChatLoadingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="bot-profile" />
      </div>
      <div className="shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 mt-2 bg-surface-card">
        <Suspense
          fallback={
            <div className="w-[60px] h-[40px] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-fg-disabled animate-pulse" />
            </div>
          }
        >
          <Player
            autoplay
            loop
            src={loadingAnimation}
            style={{ width: '60px', height: '40px' }}
          />
        </Suspense>
      </div>
    </div>
  );
}
