import type { OxQuestion } from '../type';

export const oxQuestions: OxQuestion[] = [
  {
    id: 'security-1',
    type: 'ox',
    question: '서비스마다 서로 다른 비밀번호를 사용하는 것이 안전하다.',
    correctAnswer: 'o',
    explanation:
      '서비스마다 다른 비밀번호를 사용하면 하나의 비밀번호가 유출돼도 다른 계정의 피해를 줄일 수 있습니다.',
  },
  {
    id: 'security-2',
    type: 'ox',
    question: '출처를 알 수 없는 문자 메시지의 링크는 바로 눌러도 된다.',
    correctAnswer: 'x',
    explanation:
      '출처를 알 수 없는 링크는 피싱이나 악성 프로그램으로 연결될 수 있으므로 누르지 않아야 합니다.',
  },
  {
    id: 'security-3',
    type: 'ox',
    question: '공용 Wi-Fi에서는 중요한 개인정보 입력을 피하는 것이 안전하다.',
    correctAnswer: 'o',
    explanation:
      '공용 Wi-Fi에서는 통신 내용이 노출될 수 있으므로 금융 정보나 중요한 개인정보 입력을 피해야 합니다.',
  },
];
