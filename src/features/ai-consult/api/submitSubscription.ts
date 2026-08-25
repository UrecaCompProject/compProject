import type { SubscriptionForm } from '@/features/ai-consult/types';
import type { RecommendedPlan } from '@/lib/aiConsult';
import { supabase } from '@/lib/supabaseClient';

interface SubmitSubscriptionInput {
  plan: RecommendedPlan;
  form: SubscriptionForm;
  currentPlanId?: number | null;
}

// 개인정보/서비스 약관은 필수, 마케팅은 선택 동의로 저장합니다.
const TERM_VERSION = '1.0';

export async function submitSubscription({
  plan,
  form,
  currentPlanId,
}: SubmitSubscriptionInput): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const targetPlanId = Number(plan.planId);
  if (Number.isNaN(targetPlanId)) {
    throw new Error('선택한 요금제의 ID가 올바르지 않습니다.');
  }

  const termsAgreedAt =
    form.agreedPrivacy && form.agreedService ? new Date().toISOString() : null;

  const { data: applicationData, error: applicationError } = await supabase
    .from('subscription_applications')
    .insert({
      user_id: userData.user.id,
      target_plan_id: targetPlanId,
      current_plan_id: form.type === 'change' ? (currentPlanId ?? null) : null,
      status: 'submitted',
      identity_verified: false,
      terms_agreed_at: termsAgreedAt,
    })
    .select('id')
    .single();

  if (applicationError) {
    throw new Error(`가입 신청 저장 실패: ${applicationError.message}`);
  }

  const applicationId = applicationData.id;

  const { error: logError } = await supabase
    .from('subscription_status_logs')
    .insert({
      application_id: applicationId,
      status: 'submitted',
      note: `${form.type} 신청 접수`,
    });

  if (logError) {
    throw new Error(`상태 로그 저장 실패: ${logError.message}`);
  }

  const consentRecords: {
    user_id: string;
    application_id: string;
    term_type: string;
    version: string;
    agreed_at: string;
  }[] = [];

  if (form.agreedPrivacy) {
    consentRecords.push({
      user_id: userData.user.id,
      application_id: applicationId,
      term_type: 'privacy',
      version: TERM_VERSION,
      agreed_at: new Date().toISOString(),
    });
  }

  if (form.agreedService) {
    consentRecords.push({
      user_id: userData.user.id,
      application_id: applicationId,
      term_type: 'service',
      version: TERM_VERSION,
      agreed_at: new Date().toISOString(),
    });
  }

  if (form.agreedMarketing) {
    consentRecords.push({
      user_id: userData.user.id,
      application_id: applicationId,
      term_type: 'marketing',
      version: TERM_VERSION,
      agreed_at: new Date().toISOString(),
    });
  }

  if (consentRecords.length > 0) {
    const { error: consentError } = await supabase
      .from('terms_consents')
      .insert(consentRecords);

    if (consentError) {
      throw new Error(`약관 동의 저장 실패: ${consentError.message}`);
    }
  }

  return applicationId;
}
