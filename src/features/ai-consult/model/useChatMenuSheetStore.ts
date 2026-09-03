import { create } from 'zustand';

// 채팅 입력창 위 메뉴 바텀시트(마이페이지 / 요금제 / 혜택·이벤트 / 상담 리포트)의
// 열림 상태. 메뉴 아이콘 클릭(ChatMenuBar)뿐 아니라 "마이페이지 보여줘" 처럼
// 채팅으로 요청했을 때(quickReplyRouter)도 열 수 있도록 스토어로 분리한다.
export type ChatMenuSheet = 'mypage' | 'plan' | 'reward' | 'report';

interface ChatMenuSheetState {
  openSheet: ChatMenuSheet | null;
  setOpenSheet: (sheet: ChatMenuSheet | null) => void;
}

export const useChatMenuSheetStore = create<ChatMenuSheetState>((set) => ({
  openSheet: null,
  setOpenSheet: (openSheet) => set({ openSheet }),
}));
