import { useModalStore } from '../store/useModalStore';

import Button from './Button';
import Modal from './Modal';

export default {
  title: 'shared/Modal',
  component: Modal,
};

export function Default() {
  const open = useModalStore((state) => state.open);

  return (
    <>
      <Button
        onClick={() =>
          open({
            title: '모달 제목',
            description: '모달 설명입니다.',
            content: <p>기능별 내용을 넣는 영역입니다.</p>,
          })
        }
      >
        모달 열기
      </Button>

      <Modal />
    </>
  );
}

export function WithFooter() {
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  return (
    <>
      <Button
        onClick={() =>
          open({
            title: '정말 삭제할까요?',
            description: '삭제하면 되돌릴 수 없습니다.',
            content: <p>이 작업은 취소할 수 없습니다.</p>,
            footer: (
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={close}>
                  취소
                </Button>
                <Button className="flex-1" onClick={close}>
                  삭제
                </Button>
              </div>
            ),
          })
        }
      >
        모달 열기
      </Button>

      <Modal />
    </>
  );
}

export function NonDismissible() {
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);

  return (
    <>
      <Button
        onClick={() =>
          open({
            title: '필수 확인',
            description:
              '배경 클릭이나 ESC로 닫히지 않습니다. 버튼으로만 닫을 수 있어요.',
            content: <p>dismissible: false 예시입니다.</p>,
            dismissible: false,
            footer: (
              <Button className="w-full" onClick={close}>
                확인했어요
              </Button>
            ),
          })
        }
      >
        모달 열기
      </Button>

      <Modal />
    </>
  );
}
