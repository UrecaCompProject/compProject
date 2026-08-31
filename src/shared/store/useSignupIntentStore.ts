import { create } from 'zustand';

interface SignupIntentState {
  pending: boolean;
  requestSignup: () => void;
  consumeSignup: () => void;
}

// 채팅 페이지 밖(헤더 등)에서 회원가입 버튼을 눌렀을 때는 채팅 페이지로 이동한 뒤
// 회원가입 채팅 플로우를 열어야 한다. 이동 전/후 사이에 "회원가입을 시작하려 했다"는
// 의도를 잠깐 들고 있다가, 채팅 페이지가 마운트되면 소비(consume)한다.
export const useSignupIntentStore = create<SignupIntentState>((set) => ({
  pending: false,
  requestSignup: () => set({ pending: true }),
  consumeSignup: () => set({ pending: false }),
}));
