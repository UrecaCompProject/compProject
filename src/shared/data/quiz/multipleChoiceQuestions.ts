import type { MultipleChoiceQuestion } from '@/shared/types/quiz';

export const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  {
    id: 'telecom-1',
    type: 'multiple-choice',
    category: 'telecom',
    question: '데이터 무제한 요금제에 대한 설명으로 알맞은 것은 무엇일까요?',
    options: [
      { id: '1', label: '모든 상품이 항상 최고 속도를 제공한다.' },
      { id: '2', label: '일정 사용량 이후 속도가 제한될 수 있다.' },
      { id: '3', label: 'Wi-Fi 사용량도 기본 데이터에서 차감된다.' },
      { id: '4', label: '모든 상품의 월 요금이 동일하다.' },
    ],
    correctOptionId: '2',
    explanation:
      '일부 무제한 요금제는 일정 데이터를 사용한 뒤 제한된 속도로 계속 데이터를 제공합니다.',
  },
  {
    id: 'telecom-2',
    type: 'multiple-choice',
    category: 'telecom',
    question: '5G 요금제에 대한 설명으로 알맞은 것은 무엇일까요?',
    options: [
      { id: '1', label: '모든 5G 요금제는 데이터를 무제한 제공한다.' },
      { id: '2', label: '5G 요금제에는 데이터 제한 상품이 없다.' },
      { id: '3', label: '정해진 데이터만 제공하는 5G 상품도 있다.' },
      { id: '4', label: '5G 요금제는 모두 같은 속도를 제공한다.' },
    ],
    correctOptionId: '3',
    explanation:
      '5G 요금제에도 정해진 데이터만 제공하거나 사용량 이후 속도를 제한하는 상품이 있습니다.',
  },
  {
    id: 'telecom-3',
    type: 'multiple-choice',
    category: 'telecom',
    question:
      'Wi-Fi 사용과 휴대폰 데이터에 대한 설명으로 알맞은 것은 무엇일까요?',
    options: [
      { id: '1', label: 'Wi-Fi를 사용해도 기본 데이터가 항상 차감된다.' },
      { id: '2', label: 'Wi-Fi는 통화량에서 차감된다.' },
      { id: '3', label: 'Wi-Fi는 문자 제공량에서 차감된다.' },
      {
        id: '4',
        label: '일반적으로 Wi-Fi 사용량은 기본 데이터에서 차감되지 않는다.',
      },
    ],
    correctOptionId: '4',
    explanation:
      '일반적으로 Wi-Fi를 통한 데이터 사용은 휴대폰 요금제의 기본 데이터에서 차감되지 않습니다.',
  },
];
