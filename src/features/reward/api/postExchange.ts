import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

const COUPON_VALID_DAYS = 30;

// 실제 스캔용이 아닌 목업 바코드 — 현재 시각 뒷자리 + 랜덤 3자리
function generateBarcode(): string {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${timestamp}${random}`;
}

// 상품을 배지로 교환한다: 잔액이 많은 배지 종류부터 필요한 만큼 차감하고,
// exchanges 기록을 남긴 뒤 그 exchange에 연결된 coupons row를 발급한다.
export async function postExchange(
  userId: string,
  productId: string,
  badgeCost: number,
): Promise<void> {
  const { data: userBadges, error: badgesError } = await supabase
    .from('user_badges')
    .select('badge_id, balance')
    .eq('user_id', userId)
    .gt('balance', 0)
    .order('balance', { ascending: false });

  if (badgesError) {
    throw new Error(`배지 잔액 조회 실패: ${badgesError.message}`);
  }

  const totalBalance = (userBadges ?? []).reduce(
    (sum, row) => sum + row.balance,
    0,
  );
  if (totalBalance < badgeCost) {
    throw new Error('배지가 부족합니다.');
  }

  let remaining = badgeCost;
  for (const row of userBadges ?? []) {
    if (remaining <= 0) break;
    const deduct = Math.min(row.balance, remaining);

    const { error: updateError } = await supabase
      .from('user_badges')
      .update({
        balance: row.balance - deduct,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('badge_id', row.badge_id);

    if (updateError) {
      throw new Error(`배지 차감 실패: ${updateError.message}`);
    }
    remaining -= deduct;
  }

  const { data: exchange, error: exchangeError } = await supabase
    .from('exchanges')
    .insert({ user_id: userId, product_id: productId, used_badges: badgeCost })
    .select('id')
    .single();

  if (exchangeError) {
    throw new Error(`교환 기록 저장 실패: ${exchangeError.message}`);
  }

  const { error: couponError } = await supabase.from('coupons').insert({
    exchange_id: exchange.id,
    user_id: userId,
    product_id: productId,
    barcode: generateBarcode(),
    encrypted_code: crypto.randomUUID(),
    status: 'unused',
    expired_at: dayjs().add(COUPON_VALID_DAYS, 'day').format('YYYY-MM-DD'),
  });

  if (couponError) {
    throw new Error(`쿠폰 발급 실패: ${couponError.message}`);
  }
}
