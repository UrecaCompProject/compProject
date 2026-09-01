import { create } from 'zustand';

interface SignupIntentState {
  pending: boolean;
  requestSignup: () => void;
  consumeSignup: () => void;
}

// 헤더처럼 채팅 컴포넌트 트리 밖에서 회원가입 버튼을 눌렀을 때는, 이미 항상
// 마운트되어 있는 채팅 페이지의 회원가입 플로우를 대신 열어달라고 신호를 보내야
// 한다. "회원가입을 시작하려 했다"는 의도를 잠깐 들고 있다가, 채팅 페이지 쪽
// effect가 이를 감지해 소비(consume)한다.
export const useSignupIntentStore = create<SignupIntentState>((set) => ({
  pending: false,
  requestSignup: () => set({ pending: true }),
  consumeSignup: () => set({ pending: false }),
}));
