// Lottie Player 청크를 미리 로드하는 함수
// ChatLoadingIndicator 컴포넌트와 분리해 react-refresh 규칙을 준수
let preloaded = false;
let lottiePromise: Promise<
  typeof import('@lottiefiles/react-lottie-player')
> | null = null;

// 채팅 페이지 진입 시 미리 Lottie 청크를 로드해 첫 로딩 애니메이션 지연 방지
// ChatPage의 useEffect에서 호출하면 사용자가 메시지를 보내기 전에 청크가 캐시됨
export function preloadLottiePlayer() {
  if (preloaded) return;
  preloaded = true;
  lottiePromise = import('@lottiefiles/react-lottie-player');
}

// ChatLoadingIndicator에서 사용하는 동일한 promise를 반환
// preload가 호출되지 않았으면 지연 로딩 시점에 import 실행
export function getLottiePlayerPromise() {
  if (!lottiePromise) {
    lottiePromise = import('@lottiefiles/react-lottie-player');
  }
  return lottiePromise;
}
