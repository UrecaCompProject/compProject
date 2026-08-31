import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { ChatMessage } from '@/features/ai-consult/types';
import {
  type MultipleChoiceQuestion,
  type OxQuestion,
  type QuizKind,
  type QuizQuestionMessage,
  type QuizResultMessage,
} from '@/features/chat-quiz';

import { pickRandomQuizQuestion } from '../lib/pickRandomQuizQuestion';

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
};

type StartQuizOptions = {
  includeUserMessage?: boolean;
};

const QUIZ_START_DELAY = 800;

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

export function useChatQuiz({ setMessages }: UseChatQuizParams) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const idRef = useRef(0);
  const questionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useCallback(() => {
    idRef.current = Math.max(idRef.current + 1, Date.now());
    return idRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    };
  }, []);

  const startQuiz = useCallback(
    (
      quizType: QuizKind,
      { includeUserMessage = true }: StartQuizOptions = {},
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
        { id: nextId(), type: 'ai', sentence: introduction },
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
    },
    [nextId, session, setMessages],
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
    setSession(null);
  }, [nextId, session, setMessages]);

  return {
    session,
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    finishQuiz,
  };
}
