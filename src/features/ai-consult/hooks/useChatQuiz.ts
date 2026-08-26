import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { multipleChoiceQuestions, oxQuestions } from '@/features/chat-quiz';
import type { QuizKind } from '@/features/chat-quiz';

import type {
  ChatMessage,
  QuizQuestionMessage,
  QuizResultMessage,
} from '../types';

type QuizSession = {
  quizType: QuizKind;
  currentQuestionIndex: number;
  correctCount: number;
};

type UseChatQuizParams = {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
};

function getQuestions(quizType: QuizKind) {
  return quizType === 'ox' ? oxQuestions : multipleChoiceQuestions;
}

function createQuestionMessage(
  id: number,
  quizType: QuizKind,
  questionIndex: number,
): QuizQuestionMessage {
  if (quizType === 'ox') {
    return {
      id,
      type: 'quiz-question',
      quizType,
      question: oxQuestions[questionIndex],
      questionNumber: questionIndex + 1,
      selectedAnswer: null,
      disabled: false,
    };
  }

  return {
    id,
    type: 'quiz-question',
    quizType,
    question: multipleChoiceQuestions[questionIndex],
    questionNumber: questionIndex + 1,
    selectedAnswer: null,
    disabled: false,
  };
}

export function useChatQuiz({ setMessages }: UseChatQuizParams) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const idRef = useRef(0);
  const nextId = useCallback(() => {
    idRef.current = Math.max(idRef.current + 1, Date.now());
    return idRef.current;
  }, []);

  const startQuiz = useCallback(
    (quizType: QuizKind) => {
      const nextSession: QuizSession = {
        quizType,
        currentQuestionIndex: 0,
        correctCount: 0,
      };
      const introduction =
        quizType === 'ox'
          ? '네, OX 퀴즈를 진행하겠습니다.'
          : '네, 통신·보안 퀴즈를 진행하겠습니다.';

      setSession(nextSession);
      setMessages((previous) => [
        ...previous,
        { id: nextId(), type: 'ai', sentence: introduction },
        createQuestionMessage(nextId(), quizType, 0),
      ]);
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

      const questions = getQuestions(session.quizType);
      const isLastQuestion =
        session.currentQuestionIndex === questions.length - 1;
      const resultMessage: QuizResultMessage = {
        id: nextId(),
        type: 'quiz-result',
        quizType: session.quizType,
        isCorrect,
        explanation,
        isLastQuestion,
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

      if (isCorrect) {
        setSession((current) =>
          current
            ? { ...current, correctCount: current.correctCount + 1 }
            : current,
        );
      }
    },
    [nextId, session, setMessages],
  );

  const answerOx = useCallback(
    (messageId: number, answer: 'o' | 'x') => {
      if (!session || session.quizType !== 'ox') return;
      const question = oxQuestions[session.currentQuestionIndex];

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

  const nextQuestion = useCallback(() => {
    if (!session) return;

    const questions = getQuestions(session.quizType);
    const nextQuestionIndex = session.currentQuestionIndex + 1;

    if (nextQuestionIndex >= questions.length) {
      setMessages((previous) => [
        ...previous,
        {
          id: nextId(),
          type: 'ai',
          sentence: `퀴즈가 끝났어요! 총 ${questions.length}문제 중 ${session.correctCount}문제를 맞혔어요.`,
        },
      ]);
      setSession(null);
      return;
    }

    setSession((current) =>
      current
        ? { ...current, currentQuestionIndex: nextQuestionIndex }
        : current,
    );
    setMessages((previous) => [
      ...previous,
      createQuestionMessage(nextId(), session.quizType, nextQuestionIndex),
    ]);
  }, [nextId, session, setMessages]);

  return {
    session,
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    nextQuestion,
  };
}
