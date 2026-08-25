import { Button, Card, Line, useModalStore } from '@/features/shared';

export default function MainPage() {
  const open = useModalStore((state) => state.open);

  return (
    <div className="flex flex-col px-4 pt-4 pb-12 gap-4">
      <Card>test</Card>
      <Button
        onClick={() =>
          open({ title: 'MainPage', content: <p>모달 내용입니다.</p> })
        }
      >
        MainPage
      </Button>
      <Line />
    </div>
  );
}
