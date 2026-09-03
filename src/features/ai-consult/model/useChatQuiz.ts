import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { pickRandomQuizQuestion } from '@/shared/lib/quiz/pickRandomQuizQuestion';
import type {
  MultipleChoiceQuestion,
  OxQuestion,
  QuizKind,
  QuizQuestionMessage,
  QuizResultMessage,
} from '@/shared/types/quiz';

import type { ChatMessage } from '../types';

type QuizSession =
  | {
      quizType: 'ox';
      question: OxQuestion;
    }
  | {
      quizType: 'multiple-choice';
      question: MultipleChoiceQuestion;
    };

type UseChatQuizParams = {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  onQuizFinish?: (quizType: QuizKind, rewardCount: number) => void;
};

type StartQuizOptions = {
  includeUserMessage?: boolean;
  // 게임 목록에서 시작할 때는 호출부(gameRouter)가 이미 자체 안내 메시지를
  // 보여주므로, "네, ~ 진행하겠습니다." 안내를 중복으로 보여주지 않기 위한 옵션.
  includeIntroMessage?: boolean;
};

const QUIZ_START_DELAY = 800;
// 정답/오답 설명을 읽을 시간을 준 뒤, 버튼 클릭 없이 자동으로 종료 메시지를 보여준다.
const QUIZ_RESULT_DELAY = 1500;

// useChat.tsx 등 다른 곳의 메시지 id는 순수 Date.now()를 그대로 쓴다.
// 이 훅의 id도 Date.now() 기반이라 같은 밀리초에 다른 곳의 메시지가 생성되면
// (동일 tick에서 Date.now() 호출이 겹치는 경우) id가 충돌할 수 있어 큰 오프셋으로 구간을 분리한다.
const ID_OFFSET = 10_000_000_000;

function createQuestionMessage(
  id: number,
  session: QuizSession,
): QuizQuestionMessage {
  const baseMessage = {
    id,
    type: 'quiz-question' as const,
    questionNumber: 1,
    selectedAnswer: null,
    disabled: false,
  };

  return session.quizType === 'ox'
    ? { ...baseMessage, quizType: 'ox', question: session.question }
    : {
        ...baseMessage,
        quizType: 'multiple-choice',
        question: session.question,
      };
}

export function useChatQuiz({ setMessages, onQuizFinish }: UseChatQuizParams) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const idRef = useRef(0);
  const questionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useCallback(() => {
    idRef.current = Math.max(idRef.current + 1, Date.now() + ID_OFFSET);
    return idRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  const startQuiz = useCallback(
    (
      quizType: QuizKind,
      {
        includeUserMessage = true,
        includeIntroMessage = true,
      }: StartQuizOptions = {},
    ) => {
      const introduction =
        quizType === 'ox'
          ? '네, 보안 OX 퀴즈를 진행하겠습니다.'
          : '네, 에피라 퀴즈를 진행하겠습니다.';
      const userRequest =
        quizType === 'ox' ? '보안 OX 퀴즈 할래' : '통신 상식 퀴즈 할래';
      const nextSession =
        quizType === 'ox'
          ? {
              quizType,
              question: pickRandomQuizQuestion('ox'),
            }
          : {
              quizType,
              question: pickRandomQuizQuestion('multiple-choice'),
            };

      setSession(nextSession);
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
      setMessages((previous) => [
        ...previous,
        ...(includeUserMessage
          ? [{ id: nextId(), type: 'user' as const, sentence: userRequest }]
          : []),
        ...(includeIntroMessage
          ? [{ id: nextId(), type: 'ai' as const, sentence: introduction }]
          : []),
      ]);
      questionTimerRef.current = setTimeout(() => {
        setMessages((previous) => [
          ...previous,
          createQuestionMessage(nextId(), nextSession),
        ]);
        questionTimerRef.current = null;
      }, QUIZ_START_DELAY);
    },
    [nextId, setMessages],
  );

  // 퀴즈 결과(정답/설명)를 보여준 뒤 QUIZ_RESULT_DELAY만큼 지나면 버튼 없이 자동으로
  // "퀴즈가 끝났어요!" 메시지를 붙이고, 미션 완료 콜백(배지 적립 등)을 호출한다.
  const finishQuiz = useCallback(() => {
    if (!session) return;

    const rewardCount = 1;
    setMessages((previous) => [
      ...previous,
      {
        id: nextId(),
        type: 'ai',
        sentence: `퀴즈가 끝났어요! 배지 ${rewardCount}개를 획득하였습니다.`,
      },
    ]);
    onQuizFinish?.(session.quizType, rewardCount);
    setSession(null);
  }, [nextId, onQuizFinish, session, setMessages]);

  const appendAnswerResult = useCallback(
    ({
      messageId,
      answerLabel,
      isCorrect,
      explanation,
    }: {
      messageId: number;
      answerLabel: string;
      isCorrect: boolean;
      explanation: string;
    }) => {
      if (!session) return;

      const resultMessage: QuizResultMessage = {
        id: nextId(),
        type: 'quiz-result',
        quizType: session.quizType,
        isCorrect,
        explanation,
        isLastQuestion: true,
      };

      setMessages((previous) => [
        ...previous.map((message) =>
          message.id === messageId && message.type === 'quiz-question'
            ? { ...message, disabled: true }
            : message,
        ),
        { id: nextId(), type: 'user', sentence: answerLabel },
        resultMessage,
      ]);

      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      resultTimerRef.current = setTimeout(() => {
        finishQuiz();
        resultTimerRef.current = null;
      }, QUIZ_RESULT_DELAY);
    },
    [finishQuiz, nextId, session, setMessages],
  );
  const answerOx = useCallback(
    (messageId: number, answer: 'o' | 'x') => {
      if (!session || session.quizType !== 'ox') return;
      const question = session.question;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId &&
          message.type === 'quiz-question' &&
          message.quizType === 'ox'
            ? { ...message, selectedAnswer: answer }
            : message,
        ),
      );
      appendAnswerResult({
        messageId,
        answerLabel: answer === 'o' ? 'O 그렇다' : 'X 아니다',
        isCorrect: answer === question.correctAnswer,
        explanation: question.explanation,
      });
    },
    [appendAnswerResult, session, setMessages],
  );

  const selectMultipleChoice = useCallback(
    (messageId: number, optionId: string) => {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId &&
          message.type === 'quiz-question' &&
          message.quizType === 'multiple-choice' &&
          !message.disabled
            ? { ...message, selectedAnswer: optionId }
            : message,
        ),
      );
    },
    [setMessages],
  );

  const confirmMultipleChoice = useCallback(
    (message: QuizQuestionMessage) => {
      if (
        !session ||
        session.quizType !== 'multiple-choice' ||
        message.quizType !== 'multiple-choice' ||
        message.selectedAnswer === null ||
        message.disabled
      ) {
        return;
      }

      const selectedOption = message.question.options.find(
        (option) => option.id === message.selectedAnswer,
      );
      if (!selectedOption) return;

      appendAnswerResult({
        messageId: message.id,
        answerLabel: selectedOption.label,
        isCorrect: message.selectedAnswer === message.question.correctOptionId,
        explanation: message.question.explanation,
      });
    },
    [appendAnswerResult, session],
  );

  return {
    session,
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
  };
}
