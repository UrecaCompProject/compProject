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
        레포트를 생성하면 지금까지의 대화 내용이 초기화되고 레포트 요약만 채팅에
        남아요.
      </div>
      <span className="text-[16px] text-brand-promo-primary">
        레포트를 생성하시겠어요?
      </span>
      <Button onClick={handleConfirm} className="mt-2">
        레포트 생성
      </Button>
    </div>
  );
}
