// "기타 상담" 퀵리플라이에서 파생되는 안내 정보.
// 만든이 이름/역할과 고객센터 번호는 아직 확정 전이라 여기서 한곳으로 관리한다.

export type EtcConsultKind = 'makers' | 'customerCenter';

export interface Maker {
  name: string;
  role?: string;
}

export const MAKERS: Maker[] = [
  { name: '김혜진', role: '에피라' },
  { name: '박소연', role: '에피라' },
  { name: '송동현', role: '에피라' },
  { name: '정승민', role: '에피라' },
];

export const CUSTOMER_CENTER = {
  // 화면에 보이는 번호 표기와 실제 tel: 링크에 쓰는 숫자
  phone: '국번없이 114',
  tel: '114',
  hours: '연중무휴 24시간 상담',
};
