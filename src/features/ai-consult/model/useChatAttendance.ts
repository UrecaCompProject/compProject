import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { buildAIMessage, getWelcomeQuickReplies } from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

export interface AttendanceCheckInResult {
  streak: number;
  badgeCount: number;
}

export interface UseChatAttendanceDeps {
  isLoggedIn: boolean;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  // reward feature의 useAttendance를 ChatPage에서 주입받는다.
  // (ai-consult가 reward를 직접 import하지 않도록 slot 방식으로 전달)
  checkIn: () => Promise<AttendanceCheckInResult>;
  isCheckedInToday: boolean;
}

export interface ChatAttendance {
  handleCheckIn: () => Promise<void>;
}

// "출석체크" 퀵리플라이 — 룰렛으로 보내지 않고 오늘 출석을 바로 처리한 뒤
// 결과를 채팅 메시지로 안내한다.
export function useChatAttendance({
  isLoggedIn,
  setMessages,
  setIsLoading,
  checkIn,
  isCheckedInToday,
}: UseChatAttendanceDeps): ChatAttendance {
  const handleCheckIn = useCallback(async () => {
    const quickReplies = getWelcomeQuickReplies(isLoggedIn);

    const pushAIMessage = (sentence: string) =>
      setMessages((prev) => [
        ...prev,
        buildAIMessage(sentence, quickReplies, { category: 'attendance' }),
      ]);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        sentence: '출석체크',
        category: 'attendance',
      },
    ]);

    if (isCheckedInToday) {
      pushAIMessage('오늘은 이미 출석체크를 완료했어요. 내일 다시 만나요!');
      return;
    }

    setIsLoading(true);
    try {
      const { badgeCount } = await checkIn();
      pushAIMessage(
        `출석체크가 완료됐어요! 배지 ${badgeCount}개가 적립됐어요.`,
      );
    } catch (error) {
      const alreadyChecked =
        error instanceof Error && error.message.includes('이미 출석체크');
      pushAIMessage(
        alreadyChecked
          ? '오늘은 이미 출석체크를 완료했어요. 내일 다시 만나요!'
          : '출석체크에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, setMessages, setIsLoading, checkIn, isCheckedInToday]);

  return { handleCheckIn };
}
