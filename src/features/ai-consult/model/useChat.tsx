import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsLoggedIn } from '@/entities/user';
import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { SigninModal } from '@/features/auth';
import { useChatQuiz } from '@/features/chat-quiz';
import type { QuizKind } from '@/features/chat-quiz';
import { useGameStore, useActiveGameMeta } from '@/features/games';
import type { GameId } from '@/features/games';
import { useSubscriptionStore } from '@/features/plan-subscription';
import {
  GetBadgeModal,
  missions,
  useMissionCompletion,
} from '@/features/reward';
import { useModalStore } from '@/shared';
import { requestConsult } from '@/shared/lib/aiConsult';
import type {
  ChatMode,
  ConsultInput,
  ConsultResponse,
} from '@/shared/lib/aiConsult';

import { GAME_LIST } from '../constants/gameList';
import {
  WELCOME_MESSAGE,
  buildErrorMessage,
  getWelcomeQuickReplies,
} from '../lib/chatHelpers';
import { formatResponse } from '../lib/formatResponse';
import { routeQuickReply } from '../lib/quickReplyRouter';

import { useChatCompare } from './useChatCompare';
import { useChatReport } from './useChatReport';
import { useChatSubscription } from './useChatSubscription';

import type { ChatMessage, MessageCategory } from '../types';

// 스크래치 이벤트 미션의 game_results.game_id (missions.ts의 mission.uuid)
const SCRATCH_MISSION_UUID = missions.find(
  (mission) => mission.id === 'scratch',
)?.uuid;

// 퀴즈 종류별 미션의 game_results.game_id
const QUIZ_MISSION_UUID: Record<QuizKind, string | undefined> = {
  ox: missions.find((mission) => mission.id === 'security-quiz')?.uuid,
  'multiple-choice': missions.find((mission) => mission.id === 'telecom-quiz')
    ?.uuid,
};

// AI 응답 모드를 리포트 대화 로그 분류용 category로 변환
function modeToCategory(
  mode: ChatMode | undefined,
): MessageCategory | undefined {
  if (mode === 'game') return 'game';
  if (mode === 'attendance') return 'attendance';
  if (mode === 'general') return 'general';
  if (mode === 'recommend' || mode === 'compare' || mode === 'subscribe')
    return 'plan';
  return undefined;
}

export function useChat() {
  const isLoggedIn = useIsLoggedIn();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: getWelcomeQuickReplies(isLoggedIn),
    },
  ]);
  const { recordPlay, playedTodayGameIds } = useMissionCompletion();
  const openModal = useModalStore((state) => state.open);

  // 웰컴 메시지(id 0)를 제외한 AI 응답 수 — 5회 누적 시 리포트 버튼 노출 및 비로그인 게이팅에 사용
  const aiResponseCount = messages.filter(
    (m) => m.type === 'ai' && m.id !== 0,
  ).length;

  // 퀴즈가 끝났을 때(정답/오답 관계없이 참여 보상) — 오늘의 플레이 기록 + 배지 잔액을 적립하고
  // GetBadgeModal로 알려준다. quizType으로 어느 미션인지(security-quiz/telecom-quiz) 찾는다.
  const handleQuizFinish = useCallback(
    (quizType: QuizKind, rewardCount: number) => {
      const gameId = QUIZ_MISSION_UUID[quizType];
      if (gameId) {
        recordPlay({ gameId, score: rewardCount });
      }
      openModal({ content: <GetBadgeModal badgeCount={rewardCount} /> });
    },
    [openModal, recordPlay],
  );

  const { startQuiz, answerOx, selectMultipleChoice, confirmMultipleChoice } =
    useChatQuiz({ setMessages, onQuizFinish: handleQuizFinish });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  // 에러 발생 시 재시도를 위해 마지막 사용자 입력을 보관
  const lastUserInputRef = useRef<string | null>(null);
  // AI 응답 생성 중 사용자가 중지할 수 있도록 AbortController를 보관
  const abortControllerRef = useRef<AbortController | null>(null);

  // 새 AbortController를 생성하여 ref에 저장하고 signal을 반환
  // handleSend뿐 아니라 fetchCompare/handleGenerateReport도 호출해 중지 대상이 되도록 통일
  const startRequest = useCallback(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  // 요청 완료 후 ref를 정리 — 자신이 시작한 controller와 같을 때만 null로 설정
  // 이전 요청의 finally가 나중에 실행되어 새 요청의 controller를 덮어쓰는 경쟁 상태 방지
  const clearRequest = useCallback((signal?: AbortSignal) => {
    if (signal && abortControllerRef.current?.signal !== signal) return;
    abortControllerRef.current = null;
  }, []);

  // AI 응답을 메시지 목록에 추가하고 profile을 갱신하는 공통 헬퍼
  const addAIResponse = useCallback(
    (
      response: ConsultResponse,
      request: ConsultInput,
      defaultMode: ConsultInput['mode'],
    ) => {
      const mergedProfile: ConsultInput = {
        ...request,
        mode: response.mode ?? defaultMode,
        isLoggedIn,
      };
      setProfile(mergedProfile);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai' as const,
          sentence: formatResponse(response),
          quickReplies: response.quickReplies,
          form: response.form,
          recommendations: response.recommendations,
          compareResult: response.compareResult,
          category: modeToCategory(response.mode ?? defaultMode),
        },
      ]);
    },
    [isLoggedIn],
  );

  const subscribedCurrentPlan = useSubscriptionStore((s) => s.currentPlan);
  const loadCurrentPlan = useSubscriptionStore((s) => s.loadCurrentPlan);

  // 사용자가 직접 입력한 currentPlan이 우선, 없으면 구독 스토어의 값을 사용
  const effectiveCurrentPlan =
    profile.currentPlan ?? subscribedCurrentPlan?.planName;

  const wasLoggedInRef = useRef(isLoggedIn);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 0,
        type: 'ai',
        sentence: WELCOME_MESSAGE,
        quickReplies: getWelcomeQuickReplies(isLoggedIn),
      },
    ]);
    setInput('');
    setProfile({ mode: 'menu', isLoggedIn });
  }, [isLoggedIn]);

  useEffect(() => {
    if (wasLoggedInRef.current && !isLoggedIn) {
      resetChat();
    } else if (!wasLoggedInRef.current && isLoggedIn) {
      // 채팅 도중 로그인하면 웰컴 메시지의 퀵 리플라이를 로그인 기준으로 갱신합니다.
      setMessages((prev) => {
        if (prev.length === 0 || prev[0].type !== 'ai') return prev;
        return [
          { ...prev[0], quickReplies: getWelcomeQuickReplies(true) },
          ...prev.slice(1),
        ];
      });
    }
    wasLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, resetChat]);

  // 로그인 시 DB에서 현재 요금제를 로드해 구독 스토어에 반영
  useEffect(() => {
    if (isLoggedIn) {
      loadCurrentPlan().catch(() => {
        // 미가입 사용자 등 조회 실패는 무시
      });
    }
  }, [isLoggedIn, loadCurrentPlan]);

  const {
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    handleSignupFinished,
  } = useChatSubscription({ isLoggedIn, setMessages });

  const {
    fetchCompare,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    startCompareFlow,
    setPendingComparePlan,
  } = useChatCompare({
    profile,
    isLoggedIn,
    effectiveCurrentPlan,
    isLoading,
    setIsLoading,
    setMessages,
    addAIResponse,
    startRequest,
    clearRequest,
  });

  const { isGeneratingReport, handleGenerateReport } = useChatReport({
    messages,
    effectiveCurrentPlan,
    userProfile: profile,
    isLoading,
    setIsLoading,
    setMessages,
    resetChat,
    startRequest,
    clearRequest,
  });

  // 리워드 미션 목록에서 스크래치 이벤트를 선택했을 때 — startQuiz와 동일하게
  // 사용자 발화 + AI 안내 메시지를 추가한 뒤 채팅 안에서 스크래치 카드를 시작한다.
  const startScratch = useCallback(
    (reward?: number) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'user', sentence: '스크래치 이벤트 할래' },
        {
          id: Date.now() + 1,
          type: 'ai',
          sentence: '네, 스크래치 이벤트를 진행하겠습니다.',
        },
        { id: Date.now() + 2, type: 'scratch-game', reward },
      ]);
    },
    [setMessages],
  );

  // 스크래치를 다 긁어서 배지를 획득했을 때 — 오늘의 플레이 기록 + 배지 잔액 적립.
  // ScratchGame 자체가 이미 "배지 N개 획득!" UI를 보여주므로 별도 모달은 띄우지 않는다.
  const onScratchWin = useCallback(
    (reward: number) => {
      if (!SCRATCH_MISSION_UUID) return;
      recordPlay({ gameId: SCRATCH_MISSION_UUID, score: reward });
    },
    [recordPlay],
  );

  const openSignupChat = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  }, [setMessages]);

  // 회원관리(로그인/회원가입) 모달을 연다. 이미 채팅 페이지 안이므로 회원가입 버튼을
  // 누르면 바로 채팅 안 가입 플로우로 넘어가도록 직접 연결한다.
  const requireLogin = useCallback(() => {
    openModal({
      title: '회원관리',
      content: <SigninModal onSignupClick={openSignupChat} />,
    });
  }, [openModal, openSignupChat]);

  // 바텀시트 게임(card-match, reaction, attendance) 실행/종료 — useGameStore 재활용
  const openGameStore = useGameStore((state) => state.openGame);
  const closeSheetGame = useGameStore((state) => state.closeGame);
  // 활성 게임 메타 — BottomSheet의 open/title/onBack에 사용
  const activeGameMeta = useActiveGameMeta();

  // gameRouter/quickReplyRouter에서 reward만 넘기도록 래핑 — GameOpenParams로 변환
  // 채팅 경로 게임은 source: 'chat'로 열리고, onWin 시 배지 정산 + 모달을 띄운다
  const openSheetGame = useCallback(
    (gameId: GameId, reward?: number) => {
      const gameMeta = GAME_LIST.find((g) => g.id === gameId);
      const missionUuid = gameMeta?.missionUuid;
      openGameStore(gameId, {
        reward,
        source: 'chat',
        onWin: (wonReward) => {
          if (!missionUuid) return;
          recordPlay(
            { gameId: missionUuid, score: wonReward },
            {
              onSuccess: () => {
                openModal({
                  content: <GetBadgeModal badgeCount={wonReward} />,
                });
              },
            },
          );
        },
      });
    },
    [openGameStore, recordPlay, openModal],
  );

  const handleSend = useCallback(
    async (text: string, options?: { skipUserMessage?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // 비로그인 상태로 5회 이상 대화했다면, 퀵리플라이 등 어떤 버튼을 눌러도
      // 실제 동작 대신 로그인 모달을 띄운다 (텍스트 입력은 ChatInput에서 이미 항상 막혀있음).
      if (!isLoggedIn && aiResponseCount >= 5) {
        requireLogin();
        return;
      }

      // quick reply 라우터 — 매칭되는 분기가 있으면 처리 완료
      const signal = startRequest();

      const result = await routeQuickReply({
        text: trimmed,
        messages,
        profile,
        isLoggedIn,
        effectiveCurrentPlan,
        setMessages,
        setProfile,
        setIsLoading,
        addAIResponse,
        openSubscription,
        openSignupChat,
        startCompareFlow,
        setPendingComparePlan,
        fetchCompare,
        startQuiz,
        openSheetGame,
        playedTodayGameIds,
        signal,
        // "다시 시도" 시 마지막 사용자 입력을 재전송
        retryLastInput: () => {
          const lastInput = lastUserInputRef.current;
          if (lastInput) {
            lastUserInputRef.current = null;
            // 에러 메시지를 제거하고 재시도
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.type === 'ai' && last.isError) {
                return prev.slice(0, -1);
              }
              return prev;
            });
            handleSend(lastInput, { skipUserMessage: true });
          }
        },
      });

      if (result === 'handled') return;

      // fall-through: 일반 상담 요청
      // 재생성 시에는 사용자 메시지가 이미 있으므로 추가하지 않음
      if (!options?.skipUserMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'user',
            sentence: trimmed,
            category: modeToCategory(profile.mode) ?? 'general',
          },
        ]);
      }
      setInput('');

      // 재시도를 위해 마지막 사용자 입력 보관
      lastUserInputRef.current = trimmed;

      setIsLoading(true);

      try {
        const { input: nextProfile, response } = await postQuestion(
          trimmed,
          { ...profile, isLoggedIn },
          signal,
        );
        addAIResponse(response, nextProfile, nextProfile.mode);
      } catch (error) {
        // 사용자가 의도적으로 중지한 경우 — AbortError는 안내 메시지만 표시
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai' as const,
              sentence:
                '응답 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
              quickReplies: ['메뉴로 돌아가기'],
            },
          ]);
        } else {
          setMessages((prev) => [...prev, buildErrorMessage(error)]);
        }
      } finally {
        setIsLoading(false);
        clearRequest(signal);
      }
    },
    [
      isLoading,
      messages,
      isLoggedIn,
      aiResponseCount,
      requireLogin,
      profile,
      effectiveCurrentPlan,
      startQuiz,
      openSubscription,
      openSignupChat,
      openSheetGame,
      playedTodayGameIds,
      fetchCompare,
      startCompareFlow,
      setPendingComparePlan,
      addAIResponse,
      setMessages,
      setProfile,
      setIsLoading,
      startRequest,
      clearRequest,
    ],
  );

  const handleFormSubmit = useCallback(
    async (values: Partial<ConsultInput>, summary: string) => {
      if (isLoading) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'user',
          sentence: summary || '정보를 입력했습니다.',
          category: 'plan',
        },
      ]);
      setIsLoading(true);

      const signal = startRequest();

      try {
        // skippedFields는 매 제출마다 "이번에 새로 건너뛴 필드"만 담겨 있으므로,
        // 이전 턴에서 건너뛴 필드까지 합쳐야 서버가 계속 기억할 수 있다.
        const skippedFields = Array.from(
          new Set([
            ...(profile.skippedFields ?? []),
            ...(values.skippedFields ?? []),
          ]),
        );
        const merged: ConsultInput = {
          ...profile,
          ...values,
          skippedFields,
          userMessage: '정보 입력 완료',
          mode: 'recommend',
          isLoggedIn,
        };
        const response = await requestConsult(merged, signal);
        addAIResponse(response, merged, 'recommend');
      } catch (error) {
        // 사용자가 의도적으로 중지한 경우 — AbortError는 안내 메시지만 표시
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai' as const,
              sentence:
                '응답 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
              quickReplies: ['메뉴로 돌아가기'],
            },
          ]);
        } else {
          setMessages((prev) => [...prev, buildErrorMessage(error)]);
        }
      } finally {
        setIsLoading(false);
        clearRequest(signal);
      }
    },
    [
      isLoading,
      profile,
      isLoggedIn,
      addAIResponse,
      setMessages,
      startRequest,
      clearRequest,
    ],
  );

  // AI 응답 생성 중지 — 진행 중인 fetch 요청을 취소하고 로딩 상태 해제
  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    // 중지 시에는 무조건 ref를 clear — 새 요청이 시작될 수 있도록 보장
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  // 마지막 AI 응답을 제거하고 마지막 사용자 입력으로 재생성
  const handleRegenerate = useCallback(() => {
    if (isLoading) return;
    const lastInput = lastUserInputRef.current;
    if (!lastInput) return;

    // 마지막 AI 응답 메시지 제거 후 재전송 (사용자 메시지는 유지)
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'ai') {
        return prev.slice(0, -1);
      }
      return prev;
    });
    handleSend(lastInput, { skipUserMessage: true });
  }, [isLoading, handleSend, setMessages]);

  // 사용자 메시지 수정 — 해당 메시지 이후 대화를 잘라내고 입력창에 원문 주입
  const handleEditMessage = useCallback(
    (messageId: number) => {
      if (isLoading) return;

      setMessages((prev) => {
        const targetIndex = prev.findIndex(
          (m) => m.id === messageId && m.type === 'user',
        );
        if (targetIndex === -1) return prev;

        const targetMessage = prev[targetIndex];
        if (targetMessage.type !== 'user') return prev;

        // 입력창에 원문 주입
        setInput(targetMessage.sentence);
        // 해당 메시지까지 포함하여 이후 메시지 제거 (메시지 자체도 제거)
        return prev.slice(0, targetIndex);
      });
    },
    [isLoading, setMessages, setInput],
  );

  const canShowReportButton = aiResponseCount >= 5;

  // 비로그인 상태로 5회 이상 대화하면 로그인 모달을 한 번 자동으로 띄워 가입을 유도한다.
  const hasPromptedLoginRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn) {
      hasPromptedLoginRef.current = false;
      return;
    }
    if (aiResponseCount >= 5 && !hasPromptedLoginRef.current) {
      hasPromptedLoginRef.current = true;
      requireLogin();
    }
  }, [isLoggedIn, aiResponseCount, requireLogin]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    canShowReportButton,
    handleSend,
    handleStop,
    handleRegenerate,
    handleEditMessage,
    handleSignupFinished,
    openSignupChat,
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    fetchCompare,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
    startQuiz,
    startScratch,
    onScratchWin,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    closeSheetGame,
    activeGameMeta,
    playedTodayGameIds,
  };
}
