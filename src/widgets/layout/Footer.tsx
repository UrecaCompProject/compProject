export default function Footer() {
  return (
    <footer className="pt-8 px-4 pb-24 bg-gray-200 text-caption text-fg-tertiary">
      <div className="flex gap-3 mb-2">
        <a href="/terms" className="hover:text-fg-secondary">
          이용약관
        </a>
        <a href="/privacy" className="font-bold hover:text-fg-secondary">
          개인정보처리방침
        </a>
      </div>
      <div className="space-y-0.5">
        <p>(주)유레카텔레콤 | 대표 홍길동</p>
        <p>
          사업자등록번호 123-45-67890 | 통신판매업신고 제2026-서울강남-00000호
        </p>
        <p>서울특별시 강남구 테헤란로 000, 00층</p>
        <p>고객센터 1588-0000 (평일 09:00~18:00)</p>
      </div>
      <p className="mt-2">ⓒ 2026 Ureca Telecom. All rights reserved.</p>
    </footer>
  );
}
