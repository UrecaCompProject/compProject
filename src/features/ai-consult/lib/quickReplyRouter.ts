import type {
  ConsultInput,
  ConsultResponse,
  RecommendedPlan,
} from '@/shared/lib/aiConsult';
import { requestConsult } from '@/shared/lib/aiConsult';
import type { GameId } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import { GAME_LIST } from '../constants/gameList';
import { useChatMenuSheetStore } from '../model/useChatMenuSheetStore';

import {
  buildAIMessage,
  buildErrorMessage,
  findLastRecommendedPlan,
  findLastRecommendations,
  getQuizIntent,
} from './chatHelpers';
import { handleGameSelect } from './gameRouter';
import { detectMenuSheet, menuSheetOpenMessage } from './menuSheetQuery';
import { buildMyInfoAnswer, detectMyInfoIntent } from './myInfoQuery';

import type { ChatGameId, SheetGameId } from '../constants/gameList';
import type { ChatMessage } from '../types';

type SetMessages = React.Dispatch<React.SetStateAction<ChatMessage[]>>;
type AddAIResponse = (
  response: ConsultResponse,
  request: ConsultInput,
  defaultMode: ConsultInput['mode'],
) => void;

export interface QuickReplyContext {
  text: string;
  messages: ChatMessage[];
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  // "내 요금제 뭐야 / 배지 몇 개야" 류 본인 정보 조회 답변에 사용
  currentPlan: RecommendedPlan | null | undefined;
  badgeBalance: number;
  setMessages: SetMessages;
  setProfile: (p: ConsultInput) => void;
  setIsLoading: (v: boolean) => void;
  addAIResponse: AddAIResponse;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (
    kind: QuizKind,
    opts?: { includeUserMessage?: boolean; includeIntroMessage?: boolean },
  ) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  // "출석체크" 퀵리플라이 — 오늘 출석을 바로 처리하고 결과 메시지까지 추가
  checkInAttendance: () => Promise<void>;
  playedTodayGameIds: Set<string>;
  // AbortController signal — 비동기 requestConsult 호출 취소에 사용
  signal?: AbortSignal;
  // "다시 시도" 시 마지막 사용자 입력을 재전송 — useChat의 lastUserInputRef와 handleSend 재귀 호출을 캡슐화
  retryLastInput: () => void;
}

export type QuickReplyResult = 'handled' | 'continue';

// handleSend 내 quick reply 분기를 하나의 라우터로 추출
// 매칭되는 분기가 있으면 'handled', 없으면 'continue'를 반환해 fall-through
export async function routeQuickReply(
  ctx: QuickReplyContext,
): Promise<QuickReplyResult> {
  const {
    text,
    messages,
    profile,
    isLoggedIn,
    effectiveCurrentPlan,
    currentPlan,
    badgeBalance,
    setMessages,
    setProfile,
    setIsLoading,
    addAIResponse,
    openSubscription,
    openSignupChat,
    fetchCompare,
    startQuiz,
    openSheetGame,
    checkInAttendance,
    playedTodayGameIds,
    signal,
    retryLastInput,
  } = ctx;

  // "다시 시도" 퀵리플라이 — 마지막 사용자 입력을 재전송
  if (text === '다시 시도') {
    retryLastInput();
    return 'handled';
  }

  // "내 요금제 뭐야", "배지 몇 개야" 등 본인 정보 조회 — API로 확인 가능한
  // 본인의 요금제/배지만 바로 답하고, 타인 정보·민감정보는 거절한다.
  const myInfoIntent = detectMyInfoIntent(text);
  if (myInfoIntent) {
    const { sentence, quickReplies, content } = buildMyInfoAnswer(
      myInfoIntent,
      {
        isLoggedIn,
        currentPlan,
        badgeBalance,
      },
    );
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: text },
      {
        id: Date.now() + 1,
        type: 'ai',
        sentence,
        quickReplies,
        myInfo: content,
      },
    ]);
    return 'handled';
  }

  // "마이페이지 보여줘", "전체 요금제 알려줘", "이벤트 페이지", "리포트 보여줘"
  // — 메뉴 이름을 채팅으로 말하면 해당 바텀시트를 연다.
  const menuSheet = detectMenuSheet(text);
  if (menuSheet) {
    useChatMenuSheetStore.getState().setOpenSheet(menuSheet);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: text },
      buildAIMessage(menuSheetOpenMessage(menuSheet)),
    ]);
    return 'handled';
  }

  // "게임 하기" 퀵 리플라이 — 오늘 완료한 게임을 제외하고 게임 이름들을 퀵 리플라이로 표시
  if (text === '게임 하기') {
    const availableGames = GAME_LIST.filter(
      (g) => !playedTodayGameIds.has(g.missionUuid),
    );
    const gameTitles = availableGames.map((g) => g.title);
    const message =
      availableGames.length === 0
        ? '오늘은 모든 게임을 플레이하셨어요! 내일 다시 만나요.'
        : '원하는 게임을 선택해 주세요!';
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: '게임 하기', category: 'game' },
      buildAIMessage(message, [...gameTitles, '메뉴로 돌아가기'], {
        category: 'game',
      }),
    ]);
    return 'handled';
  }

  // 게임 이름 퀵 리플라이 매칭 — 오늘 완료한 게임은 진입 차단
  const matchedGame = GAME_LIST.find((g) => g.title === text);
  if (matchedGame) {
    if (playedTodayGameIds.has(matchedGame.missionUuid)) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '오늘은 이미 플레이한 게임이에요. 내일 다시 도전해 주세요!',
          ['게임 하기', '메뉴로 돌아가기'],
          { category: 'game' },
        ),
      ]);
      return 'handled';
    }
    handleGameSelect(matchedGame.id as ChatGameId | SheetGameId, {
      setMessages,
      startQuiz,
      openSheetGame,
    });
    return 'handled';
  }

  // "출석체크" 퀵 리플라이 — 룰렛으로 보내지 않고 오늘 출석을 바로 처리한 뒤
  // 완료/배지 적립 결과를 채팅 메시지로 안내
  if (text === '출석체크') {
    await checkInAttendance();
    return 'handled';
  }

  // 퀴즈 의도 감지 — "OX 퀴즈 하자", "통신 상식 퀴즈" 등.
  // 퀵 리플라이로 게임을 고를 때처럼 사용자가 입력한 문장도 한 번 남긴다.
  const quizIntent = getQuizIntent(text);
  if (quizIntent) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: text, category: 'game' },
    ]);
    startQuiz(quizIntent, { includeUserMessage: false });
    return 'handled';
  }

  // "기타 상담" — 만든이 / 고객센터 안내로 분기하는 퀵리플라이를 띄운다.
  if (text === '기타 상담') {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: '기타 상담' },
      buildAIMessage('무엇을 도와드릴까요?', [
        '만든 이',
        '고객센터',
        '메뉴로 돌아가기',
      ]),
    ]);
    return 'handled';
  }

  // "만든이" / "고객센터" — 채팅 인라인 안내 (ChatMessageList가 etcConsult로 렌더)
  if (text === '만든 이' || text === '고객센터') {
    const kind = text === '만든 이' ? 'makers' : 'customerCenter';
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: text },
      {
        id: Date.now() + 1,
        type: 'ai',
        sentence: '',
        etcConsult: kind,
        quickReplies: [
          kind === 'makers' ? '고객센터' : '만든 이',
          '메뉴로 돌아가기',
        ],
      },
    ]);
    return 'handled';
  }

  // 회원가입 흐름
  if (text === '회원 가입하기') {
    openSignupChat();
    return 'handled';
  }

  // 요금제 가입/신청 흐름 — 퀵리플라이("요금제 가입하기")든 자유 입력("요금제 신청할래")이든
  // 온라인/영업점 경로 선택 단계 없이 바로 가입 시트를 연다.
  const isSubscribeIntent =
    text === '온라인 가입' ||
    text === '요금제 가입하기' ||
    /요금제\s*가입|가입\s*하기|가입\s*할래|신청/.test(text);
  if (isSubscribeIntent) {
    // 자유 입력이면 사용자 발화를 한 번 남긴다 (정형 퀵리플라이 문구는 그대로 두지 않음)
    if (text !== '온라인 가입' && text !== '요금제 가입하기') {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'user', sentence: text, category: 'plan' },
      ]);
    }

    if (!isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '요금제 가입은 로그인 후에 가능해요. 회원가입을 진행해주세요.',
          ['회원 가입하기', '기타 상담'],
        ),
      ]);
      return 'handled';
    }

    setMessages((prev) => [
      ...prev,
      buildAIMessage(
        '요금제 가입 화면을 열었어요. 원하는 요금제를 선택해 가입을 진행해 주세요.',
        ['메뉴로 돌아가기'],
      ),
    ]);
    openSubscription(findLastRecommendedPlan(messages) ?? null);
    return 'handled';
  }

  // 현재 요금제와 마지막 추천 요금제 비교
  if (text === '현재 요금제와 비교') {
    const lastPlan = findLastRecommendedPlan(messages);
    if (!lastPlan) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '비교할 추천 요금제가 없어요. 먼저 요금제 추천을 받아주세요.',
          ['요금제 추천받기', '메뉴로 돌아가기'],
        ),
      ]);
      return 'handled';
    }
    if (!effectiveCurrentPlan) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage('비교할 요금제를 선택해 주세요.', ['메뉴로 돌아가기'], {
          planCompare: true,
        }),
      ]);
      return 'handled';
    }
    await fetchCompare(lastPlan.planName);
    return 'handled';
  }

  // 요금제 비교하기 메뉴 - AI 호출 없이 카탈로그 기반 비교 컴포넌트를 바로 렌더링.
  // 두 컬럼 모두 드롭다운으로 요금제를 골라 비교한다. (왼쪽 기본값은 내 요금제)
  if (text === '요금제 비교하기') {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        sentence: '요금제 비교하기',
        category: 'plan',
      },
      buildAIMessage('비교할 요금제를 선택해 주세요.', ['메뉴로 돌아가기'], {
        planCompare: true,
        category: 'plan',
      }),
    ]);
    return 'handled';
  }

  // 이미 추천받은 상태에서 '요금제 추천받기' 재탭 — 새 조건 수집 또는 다른 요금제 분기
  if (text === '요금제 추천받기') {
    const lastRecs = findLastRecommendations(messages);
    if (lastRecs.length > 0) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '이미 요금제를 추천받으셨어요. 새로운 조건으로 다시 추천받거나, 방금 본 요금제와 다른 요금제를 확인할 수 있어요.',
          ['새 조건으로 다시 추천받기', '다른 요금제 보기', '메뉴로 돌아가기'],
        ),
      ]);
      return 'handled';
    }
    // 추천받은 적이 없으면 일반 추천 플로우로 진행 (postQuestion으로 fall-through)
  }

  // '다른 요금제 보기' — 이전 추천 planId를 제외하고 같은 조건으로 재추천
  if (text === '다른 요금제 보기') {
    const lastRecs = findLastRecommendations(messages);
    const excludePlanIds = lastRecs.map((r) => r.planId);
    setIsLoading(true);
    try {
      const request: ConsultInput = {
        ...profile,
        userMessage: '다른 요금제 보기',
        mode: 'recommend',
        isLoggedIn,
        excludePlanIds,
      };
      const response = await requestConsult(request, signal);
      addAIResponse(response, request, 'recommend');
    } catch (error) {
      // AbortError는 useChat의 handleStop에서 처리하므로 'handled' 반환
      if (error instanceof DOMException && error.name === 'AbortError')
        return 'handled';
      setMessages((prev) => [...prev, buildErrorMessage(error)]);
    } finally {
      setIsLoading(false);
    }
    return 'handled';
  }

  // '새 조건으로 다시 추천받기' — profile을 리셋하고 폼으로 새 조건 수집
  if (text === '새 조건으로 다시 추천받기') {
    const resetProfile: ConsultInput = {
      mode: 'recommend',
      isLoggedIn,
    };
    setProfile(resetProfile);
    setIsLoading(true);
    try {
      const request: ConsultInput = {
        ...resetProfile,
        userMessage: '새 조건으로 다시 추천받기',
      };
      const response = await requestConsult(request, signal);
      addAIResponse(response, request, 'recommend');
    } catch (error) {
      // AbortError는 useChat의 handleStop에서 처리하므로 'handled' 반환
      if (error instanceof DOMException && error.name === 'AbortError')
        return 'handled';
      setMessages((prev) => [...prev, buildErrorMessage(error)]);
    } finally {
      setIsLoading(false);
    }
    return 'handled';
  }

  return 'continue';
}
