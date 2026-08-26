import type { OxQuestion } from '../type';

export const oxQuestions: OxQuestion[] = [
  {
    id: 'telecom-1',
    type: 'ox',
    question:
      '데이터 무제한 요금제라도 일정 데이터 사용 후 속도가 제한되는 상품이 있을 수 있다.',
    correctAnswer: 'o',
    explanation:
      '무제한 요금제 중에는 일정 데이터를 사용한 뒤 제한된 속도로 계속 제공하는 상품이 있습니다.',
  },
  {
    id: 'telecom-2',
    type: 'ox',
    question: '모든 5G 요금제는 데이터를 무제한으로 제공한다.',
    correctAnswer: 'x',
    explanation: '5G 요금제에도 정해진 데이터만 제공하는 상품이 있습니다.',
  },
  {
    id: 'telecom-3',
    type: 'ox',
    question: 'Wi-Fi를 사용하면 휴대폰 요금제의 기본 데이터가 차감된다.',
    correctAnswer: 'x',
    explanation:
      '일반적으로 Wi-Fi를 통한 데이터 사용은 요금제의 기본 데이터에서 차감되지 않습니다.',
  },
];
