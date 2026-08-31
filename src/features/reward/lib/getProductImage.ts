// DB의 image는 확장자 없는 슬러그(예: "gs25-1thousand-coupon")로 들어있고,
// public/coupons/ 폴더에 같은 이름의 png 파일을 두면 이 경로로 바로 서빙된다.
// (Vite는 public/ 아래 파일을 루트 경로로 그대로 서빙함)
export function getProductImage(slug: string | null): string {
  if (!slug) return '';
  return `/coupons/${slug}.png`;
}
