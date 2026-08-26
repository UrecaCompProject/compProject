import type { MultipleChoiceQuestion } from '../type';

export const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  {
    id: 'security-1',
    type: 'multiple-choice',
    category: 'security',
    question: '다음 중 개인정보를 안전하게 보호하는 방법은 무엇일까요?',
    options: [
      { id: '1', label: '서비스마다 서로 다른 비밀번호를 사용한다.' },
      { id: '2', label: '모든 계정에 같은 비밀번호를 사용한다.' },
      { id: '3', label: '비밀번호를 다른 사람과 공유한다.' },
      { id: '4', label: '공공장소에 비밀번호를 적어 둔다.' },
    ],
    correctOptionId: '1',
    explanation:
      '서비스마다 서로 다른 비밀번호를 사용하면 하나의 비밀번호가 유출됐을 때 다른 계정까지 피해를 입는 것을 줄일 수 있습니다.',
  },
  {
    id: 'security-2',
    type: 'multiple-choice',
    category: 'security',
    question:
      '출처를 알 수 없는 문자 메시지에 링크가 있다면 어떻게 해야 할까요?',
    options: [
      { id: '1', label: '내용을 확인하기 위해 바로 누른다.' },
      { id: '2', label: '친구에게 대신 눌러 달라고 부탁한다.' },
      { id: '3', label: '링크를 누르지 않고 발신자를 확인한다.' },
      { id: '4', label: '다른 사람에게 링크를 전달한다.' },
    ],
    correctOptionId: '3',
    explanation:
      '출처를 알 수 없는 링크는 피싱이나 악성 프로그램으로 연결될 수 있으므로 누르지 않아야 합니다.',
  },
  {
    id: 'security-3',
    type: 'multiple-choice',
    category: 'security',
    question: '공용 Wi-Fi를 사용할 때 가장 안전한 행동은 무엇일까요?',
    options: [
      { id: '1', label: '금융 정보를 바로 입력한다.' },
      { id: '2', label: '중요한 개인정보 입력을 피한다.' },
      { id: '3', label: '자동 로그인을 항상 활성화한다.' },
      { id: '4', label: '다른 사람과 계정을 공유한다.' },
    ],
    correctOptionId: '2',
    explanation:
      '공용 Wi-Fi에서는 통신 내용이 노출될 가능성이 있으므로 중요한 개인정보 입력을 피하는 것이 안전합니다.',
  },
];
