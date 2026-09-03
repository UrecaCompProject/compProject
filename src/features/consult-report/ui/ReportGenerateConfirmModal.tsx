import { Button, useModalStore } from '@/shared';

interface ReportGenerateConfirmModalProps {
  onConfirm: () => void;
}

export default function ReportGenerateConfirmModal({
  onConfirm,
}: ReportGenerateConfirmModalProps) {
  const close = useModalStore((state) => state.close);

  const handleConfirm = () => {
    close();
    onConfirm();
  };

  return (
    <div className="flex flex-col gap-2 text-center text-body text-fg-tertiary">
      <div className="wrap-normal break-keep">
        리포트를 생성하면 지금까지의 대화 내용이 초기화되고 리포트 요약만 채팅에
        남아요.
      </div>
      <br />
      <br />
      리포트를 생성하시겠어요?
      <Button onClick={handleConfirm} className="mt-2">
        리포트 생성
      </Button>
    </div>
  );
}
