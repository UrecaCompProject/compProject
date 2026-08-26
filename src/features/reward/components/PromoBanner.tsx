import bannerImage from '@/assets/images/banner1.png';

export default function PromoBanner() {
  return (
    <section className="overflow-hidden bg-accent-soft">
      <img
        src={bannerImage}
        alt="배지 70개를 모으면 배스킨라빈스 파인트 무료"
        className="block aspect-[13/5] w-full object-cover"
      />
    </section>
  );
}
