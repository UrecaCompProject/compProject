import { Button, useModalStore } from '@/shared';

export default function RefreshCheckModal() {
  const close = useModalStore((state) => state.close);

  const handleRefresh = () => {
    close();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-2 text-center text-body text-fg-tertiary">
      새로고침하면 지금까지의 대화 내용이 사라져요.
      <br />
      새로고침하시겠어요?
      <Button onClick={handleRefresh} className="mt-2">
        새로고침
      </Button>
    </div>
  );
}
