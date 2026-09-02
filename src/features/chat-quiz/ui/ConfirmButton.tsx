import { Button } from '@/shared';

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
      className="w-full max-w-[358px]"
    >
      선택했어요
    </Button>
  );
}
