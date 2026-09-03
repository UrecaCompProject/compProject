import { Phone } from 'lucide-react';

import {
  CUSTOMER_CENTER,
  MAKERS,
  type EtcConsultKind,
} from '../constants/etcConsult';

// "기타 상담" > "만든이" / "고객센터" 응답 말풍선 본문.
// 고객센터 번호는 tel: 링크(탭 대상)라 버튼과 같은 프로모 프라이머리로 강조.
const STRONG = 'font-bold text-brand-promo-primary';
// 만든이 이름 — 클릭 대상이 아니므로 링크색이 아닌 중립 강조로만 표시
const NAME = 'font-medium text-fg-primary';

function Makers() {
  const roles = MAKERS.map((maker) => maker.role);
  const sharedRole =
    roles.every((role) => role && role === roles[0]) && roles[0]
      ? roles[0]
      : null;

  // 역할이 전부 같으면 헤더로 한 번만 쓰고 이름은 한 줄로 모은다.
  // 캐릭터는 말풍선 오른쪽 아래에서 몸통이 조금 잘린 채 빼꼼 나오게 배치한다.
  // AIChat 말풍선의 px-4 py-2.5 패딩을 상쇄(-mx-4 -my-2.5)해 클립 경계를
  // 말풍선의 실제 둥근 모서리에 맞춘다. 안 그러면 패딩 안쪽에서 잘려 어색해진다.
  if (sharedRole) {
    return (
      <div className="relative -mx-4 -my-2.5 overflow-hidden rounded-2xl rounded-tl-sm">
        <div className="flex flex-col gap-1.5 px-4 pt-2.5 pb-16 pr-10">
          <p>이 서비스를 만든 {sharedRole} 팀이에요.</p>
          <p>
            {MAKERS.map((maker, i) => (
              <span key={maker.name}>
                {i > 0 && <span className="text-fg-tertiary"> · </span>}
                <span className={NAME}>{maker.name}</span>
              </span>
            ))}
          </p>
        </div>
        <img
          src="/ephyra-hi.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-0 w-24 select-none"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p>이 서비스를 만든 사람들이에요.</p>
      <ul className="flex flex-col gap-1">
        {MAKERS.map((maker) => (
          <li key={maker.name}>
            <span className={NAME}>{maker.name}</span>
            {maker.role && (
              <span className="text-fg-tertiary"> · {maker.role}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EtcConsultAnswer({ kind }: { kind: EtcConsultKind }) {
  if (kind === 'makers') return <Makers />;

  return (
    // AIChat 말풍선 기본 bottom 패딩(10px)에 6px를 더해 16px가 되도록 한다.
    <div className="flex flex-col gap-2 pb-1.5">
      <p>도움이 필요하시면 고객센터로 문의해 주세요.</p>
      <a
        href={`tel:${CUSTOMER_CENTER.tel}`}
        className="flex items-center gap-2 rounded-xl bg-brand-pale px-3 py-2 transition-colors active:bg-surface-pressed"
      >
        <Phone
          size={18}
          className="shrink-0 text-brand-promo-primary"
          aria-hidden
        />
        <span className="flex flex-col">
          <span className={STRONG}>{CUSTOMER_CENTER.phone}</span>
          <span className="text-[12px] text-fg-tertiary">
            {CUSTOMER_CENTER.hours}
          </span>
        </span>
      </a>
    </div>
  );
}
