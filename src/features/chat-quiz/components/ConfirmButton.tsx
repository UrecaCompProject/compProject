import { Button } from '@/features/shared';

type ConfirmButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

export default function ConfirmButton({
  disabled,
  onClick,
}: ConfirmButtonProps) {
  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      disabled={disabled}
      onClick={onClick}
      className="h-[51px] w-full max-w-[358px] rounded-xl text-[16px] font-extrabold disabled:text-fg-disabled"
    >
      선택했어요
    </Button>
  );
}
