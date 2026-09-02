import type { ComponentType, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
  CompareResult,
} from '@/shared/lib/aiConsult';

import AIChat from './AIChat';
import AIChatExtras from './AIChatExtras';
import ChatLoadingIndicator from './ChatLoadingIndicator';
import MyChat from './MyChat';
import ScratchGameMessage from './ScratchGameMessage';

import type { ChatMessage } from '../types';

type QuizMessage = Extract<
  ChatMessage,
  { type: 'quiz-question' | 'quiz-result' }
>;
type QuizQuestionMessage = Extract<ChatMessage, { type: 'quiz-question' }>;

interface ChatMessageListSlots {
  ReportCard: ComponentType<{ report: ReportOutput }>;
  CompareResultSheet: ComponentType<{
    result?: CompareResult;
    onSubscribe?: (plan: RecommendedPlan) => void;
    onRecompare?: (planAName: string, planBName: string) => void;
  }>;
  SignupChat: ComponentType<{ onFinish?: () => void }>;
  ChatQuizMessage: ComponentType<{
    message: QuizMessage;
    onOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
    onMultipleChoiceSelect: (messageId: number, optionId: string) => void;
    onMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
    AIChat: ComponentType<{ sentence: ReactNode; className?: string }>;
  }>;
  PlanSubscriptionSheet: ComponentType<{
    active?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    plan: RecommendedPlan | null;
    onComplete?: () => void;
  }>;
  ScratchGame: ComponentType<{
    reward?: number;
    onWin?: (reward: number) => void;
    onClose?: () => void;
  }>;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isGeneratingReport?: boolean;
  canShowReportButton?: boolean;
  onSignupFinished?: () => void;
  onFormSubmit?: (values: Partial<ConsultInput>, summary: string) => void;
  formDefaults?: Partial<ConsultInput>;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onPlanCompare?: (plan: RecommendedPlan) => void;
  onRecompare?: (planAName: string, planBName: string) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  subscriptionOpen?: boolean;
  subscriptionPlan?: RecommendedPlan | null;
  onSubscriptionClose?: (open: boolean) => void;
  onQuizOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
  onQuizMultipleChoiceSelect: (messageId: number, optionId: string) => void;
  onQuizMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
  onScratchWin?: (reward: number) => void;
  onScratchClose?: () => void;
  onRegenerate?: () => void;
  onEditMessage?: (messageId: number) => void;
  onReportButtonVisibleChange?: (visible: boolean) => void;
  slots: ChatMessageListSlots;
}

// 이 값(px) 이내로 스크롤이 바닥에 가까우면 스크롤 방향과 무관하게 항상 노출
const REPORT_BUTTON_BOTTOM_THRESHOLD = 24;

export default function ChatMessageList({
  messages,
  isLoading = false,
  isGeneratingReport = false,
  canShowReportButton = false,
  onSignupFinished,
  onFormSubmit,
  formDefaults,
  onPlanSubscribe,
  onPlanCompare,
  onRecompare,
  onGenerateReport,
  subscriptionOpen = false,
  subscriptionPlan,
  onSubscriptionClose,
  onQuizOxAnswer,
  onQuizMultipleChoiceSelect,
  onQuizMultipleChoiceConfirm,
  onScratchWin,
  onScratchClose,
  onRegenerate,
  onEditMessage,
  onReportButtonVisibleChange,
  slots,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);
  // 스크롤 이벤트에서 계속 갱신 — 퀵 리플라이·ChatMenuBar가 펼쳐져 container
  // 크기가 바뀌는 시점에 "그 직전에 바닥 근처였는지"를 판단하는 데 쓰인다.
  const wasNearBottomRef = useRef(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const isInputFocused = () => {
      const active = document.activeElement;
      // 폼 입력 중 유효성 에러 문구가 붙었다 떨어지거나, 모바일 키보드가
      // 열고 닫힐 때도 이 콜백이 실행된다. 입력 필드에 포커스가 가 있는
      // 동안은 사용자가 타이핑 중인 것이므로 스크롤을 강제로 튕기지 않는다.
      // (버튼 클릭으로 넘어가는 회원가입 단계 전환 등은 포커스가 버튼에
      // 있어 계속 자동 스크롤된다.)
      return (
        active instanceof HTMLElement &&
        container.contains(active) &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)
      );
    };

    // 새 메시지가 끝까지 안 보이더라도, 맨 아래로 붙이기보다는
    // 새로 추가된(또는 SignupChat처럼 내부 상태로 늘어난) 마지막 메시지의
    // 시작 지점이 화면 위쪽에 오도록 스크롤해 처음부터 읽을 수 있게 한다.
    // scrollIntoView는 overflow-hidden인 상위 Layout까지 스크롤시켜 레이아웃이 깨지므로
    // 스크롤 컨테이너에만 직접 scrollTo를 호출한다.
    const scrollToLastMessageTop = () => {
      const target = lastMessageRef.current;
      if (!target || isInputFocused()) return;

      const offset =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top: offset, behavior: 'smooth' });
    };

    // 퀵 리플라이·ChatMenuBar가 펼쳐지거나 접혀서 container 자체 높이가
    // 바뀔 때 실행된다. 원래 바닥 근처를 보고 있었다면 줄어든/늘어난
    // 뷰포트에서도 계속 바닥에 붙여준다. 위쪽 대화를 읽던 중이었다면
    // (scrollTop 유지 = 보던 위치 그대로) 건드리지 않는다.
    // 트랜지션이 진행되는 동안 container 크기가 여러 번(중간값으로) 바뀌므로
    // 매번 즉시 보정하면 트랜지션 도중의 중간 크기에 맞춰졌다가 멈춰버린다.
    // 크기 변화가 멎을 때까지 디바운스한 뒤 최종 크기 기준으로 한 번만 보정한다.
    let stickToBottomTimeout: ReturnType<typeof setTimeout> | undefined;
    const stickToBottomIfWasNearBottom = () => {
      if (!wasNearBottomRef.current || isInputFocused()) return;
      clearTimeout(stickToBottomTimeout);
      stickToBottomTimeout = setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
      }, 450);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === content) scrollToLastMessageTop();
        else if (entry.target === container) stickToBottomIfWasNearBottom();
      }
    });
    observer.observe(content);
    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(stickToBottomTimeout);
    };
  }, []);

  // 레포트 생성 버튼: 위로 스크롤할 때는 그대로 유지, 아래로 스크롤하면
  // 사라지고, 바닥 근처로 돌아오면 방향과 상관없이 다시 노출한다.
  // wasNearBottomRef도 여기서 함께 갱신한다.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight <
        REPORT_BUTTON_BOTTOM_THRESHOLD;
      const isScrollingUp = scrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = scrollTop;
      wasNearBottomRef.current = isNearBottom;

      onReportButtonVisibleChange?.(isNearBottom || isScrollingUp);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onReportButtonVisibleChange]);

  const lastIndex = messages.length - 1;
  // 마지막 user 메시지 인덱스 — 수정 버튼은 이 메시지에만 표시
  const lastUserIndex = messages.reduce(
    (acc, m, i) => (m.type === 'user' ? i : acc),
    -1,
  );

  return (
    <div
      ref={scrollContainerRef}
      className={`min-h-0 flex-1 overflow-y-auto pt-4
        ${canShowReportButton && !isLoading ? 'pb-17' : 'pb-4'}
      `}
    >
      <div ref={contentRef} className="flex flex-col gap-4 ">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === lastIndex ? lastMessageRef : undefined}
          >
            {message.type === 'ai' && (
              <>
                <AIChat
                  sentence={message.sentence}
                  variant={message.isError ? 'error' : 'default'}
                  onRegenerate={onRegenerate}
                  showRegenerate={
                    index === lastIndex && !isLoading && !!message.isError
                  }
                />
                <AIChatExtras
                  message={message}
                  isLast={index === lastIndex}
                  isLoading={isLoading}
                  isGeneratingReport={isGeneratingReport}
                  canShowReportButton={canShowReportButton}
                  onPlanSubscribe={onPlanSubscribe}
                  onPlanCompare={onPlanCompare}
                  onRecompare={onRecompare}
                  onGenerateReport={onGenerateReport}
                  onFormSubmit={onFormSubmit}
                  formDefaults={formDefaults}
                  slots={{
                    ReportCard: slots.ReportCard,
                    CompareResultSheet: slots.CompareResultSheet,
                  }}
                />
              </>
            )}
            {message.type === 'user' && (
              <div className="flex flex-col items-end">
                <MyChat
                  sentence={message.sentence}
                  onEdit={
                    onEditMessage ? () => onEditMessage(message.id) : undefined
                  }
                  showEdit={index === lastUserIndex && !isLoading}
                />
              </div>
            )}

            {message.type === 'signup' && (
              <slots.SignupChat onFinish={onSignupFinished} />
            )}

            {(message.type === 'quiz-question' ||
              message.type === 'quiz-result') && (
              <slots.ChatQuizMessage
                message={message}
                onOxAnswer={onQuizOxAnswer}
                onMultipleChoiceSelect={onQuizMultipleChoiceSelect}
                onMultipleChoiceConfirm={onQuizMultipleChoiceConfirm}
                AIChat={AIChat}
              />
            )}

            {message.type === 'scratch-game' && (
              <ScratchGameMessage
                reward={message.reward}
                onWin={onScratchWin}
                onClose={onScratchClose}
                scratchGame={slots.ScratchGame}
              />
            )}
          </div>
        ))}
        {isLoading && <ChatLoadingIndicator />}
      </div>

      <slots.PlanSubscriptionSheet
        active={subscriptionOpen}
        open={subscriptionOpen}
        onOpenChange={onSubscriptionClose ?? (() => {})}
        plan={subscriptionPlan ?? null}
        onComplete={onSignupFinished}
      />
    </div>
  );
}
