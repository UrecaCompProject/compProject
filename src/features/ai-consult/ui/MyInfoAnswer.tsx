import type { MyInfoContent } from '../lib/myInfoQuery';

// "내 요금제 뭐야" / "배지 몇 개야" 응답 말풍선 본문.
// 요금제명·배지 개수는 볼드 + 브랜드 프라이머리, 가격·데이터는 프라이머리 색만
// (폰트 웨이트는 그대로) 강조한다.
const STRONG = 'font-bold text-brand-promo-secondary';
const VALUE = 'text-brand-promo-secondary';

export default function MyInfoAnswer({ content }: { content: MyInfoContent }) {
  if (content.kind === 'badge') {
    return (
      <p>
        현재 보유하신 배지는 총{' '}
        <span className={STRONG}>
          {content.count.toLocaleString('ko-KR')}개
        </span>
        예요.
      </p>
    );
  }

  const { planName, fee, dataAmount } = content;
  return (
    <div className="flex flex-col">
      <p>
        현재 이용 중인 요금제는 <span className={STRONG}>{planName}</span>
        이에요.
      </p>
      {(fee || dataAmount) && (
        <p>
          {fee && (
            <>
              월 <span className={VALUE}>{fee}</span>
            </>
          )}
          {fee && dataAmount && ' · '}
          {dataAmount && (
            <>
              데이터 <span className={VALUE}>{dataAmount}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
