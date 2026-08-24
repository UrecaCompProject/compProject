import { useState } from 'react';

import BottomSheet from './BottomSheet';
import Button from './Button';

export default {
  title: 'shared/BottomSheet',
  component: BottomSheet,
};

export function Default() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>바텀시트 열기</Button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="바텀시트 제목"
        description="바텀시트 설명입니다."
      >
        <p>기능별 내용을 넣는 영역입니다.</p>
      </BottomSheet>
    </>
  );
}
