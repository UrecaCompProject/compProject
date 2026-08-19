import { AIChat, MyChat } from '@/features/ai-consult';
import { Input } from '@/features/shared';

export default function ChatPage() {
  const messages = [
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
    {
      type: 'user',
      id: 2,
      sentence: `test`,
    },
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
    {
      type: 'ai',
      id: 1,
      sentence: [
        '안녕하세요! AI 요금제 도우미 해리에오.🪼',
        '고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.',
        '아래 원하시는 방식을 선택하시거나 편하게 대화를 시작해보세요!',
      ].join('\n\n'),
    },
  ];
  return (
    <div>
      <div className="flex h-[calc(100vh-49px-45px-16px)] flex-col gap-4 overflow-y-auto text-caption py-4">
        {messages.map((message, index) => {
          if (message.type === 'ai') {
            return <AIChat key={index} sentence={message.sentence} />;
          } else if (message.type === 'user') {
            return <MyChat key={index} sentence={message.sentence} />;
          }
        })}
      </div>
      <Input placeholder="AI에게 질문해보세요" />
    </div>
  );
}
