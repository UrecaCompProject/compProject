import { Fragment, type ReactNode, useMemo, useState } from 'react';

import { Check, CheckCircle2, ChevronDown } from 'lucide-react';

import { usePlanCatalog } from '@/entities/plan';
import { useAuth } from '@/entities/user';
import { BottomSheet, Button, Input } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { useSubmitSubscription } from '../model/useSubmitSubscription';

import type { SubscriptionForm } from '../types';

type SubscriptionStep =
  'planSelect' | 'confirm' | 'delivery' | 'agreement' | 'complete';
type SubscriptionType = 'new' | 'change';

const initialForm: SubscriptionForm = {
  type: 'new',
  address: '',
  addressDetail: '',
  simType: '',
  agreedPrivacy: false,
  agreedService: false,
  agreedMarketing: false,
};

interface PlanSubscriptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: RecommendedPlan | null;
  onComplete?: () => void;
}

const STEP_TITLES: Record<
  SubscriptionStep,
  { title: string; label: string; desc: string }
> = {
  planSelect: {
    title: '요금제 선택',
    label: '요금',
    desc: '가입할 요금제를 선택해주세요',
  },
  confirm: {
    title: '가입 유형',
    label: '유형',
    desc: '가입 방법을 선택해주세요',
  },
  delivery: {
    title: '배송/유심',
    label: '배송',
    desc: 'USIM 유형을 선택해주세요',
  },
  agreement: {
    title: '약관 동의',
    label: '약관',
    desc: '필수 약관에 동의해주세요',
  },
  complete: { title: '신청 완료', label: '완료', desc: '' },
};

const STEPS: SubscriptionStep[] = [
  'planSelect',
  'confirm',
  'delivery',
  'agreement',
  'complete',
];

function StepIndicator({
  current,
  onChange,
}: {
  current: SubscriptionStep;
  onChange: (step: SubscriptionStep) => void;
}) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((step, index) => {
        const isActive = step === current;
        const isPast = index < currentIndex;
        const clickable = index <= currentIndex;

        return (
          <Fragment key={step}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onChange(step)}
              className={`flex shrink-0 flex-col items-center gap-1 ${
                clickable ? 'cursor-pointer' : 'cursor-default opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-caption font-semibold ${
                  isActive
                    ? 'bg-brand-promo-primary text-surface-card'
                    : isPast
                      ? 'bg-brand-promo-primary/20 text-brand-promo-primary'
                      : 'bg-surface-pressed text-fg-disabled'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-[10px] text-fg-secondary whitespace-nowrap">
                {STEP_TITLES[step].label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                  index < currentIndex ? 'bg-brand-promo-primary' : 'bg-border'
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function PlanSummary({ plan }: { plan: RecommendedPlan }) {
  return (
    <div className="rounded-2xl border border-border-brand bg-brand-promo-primary/5 p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <h6 className="text-body font-bold text-fg-primary">{plan.planName}</h6>
        <span className="text-body font-bold text-brand-promo-secondary">
          월 {plan.monthlyFee?.toLocaleString()}원
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-fg-secondary">
        {plan.data && <span>데이터 {plan.data}</span>}
        {plan.voice && <span>음성 {plan.voice}</span>}
        {plan.message && <span>메시지 {plan.message}</span>}
      </div>
      {plan.reason && (
        <p className="rounded-xl bg-surface-card p-3 text-caption text-fg-tertiary">
          {plan.reason}
        </p>
      )}
    </div>
  );
}

function PlanSelectItem({
  plan,
  selected,
  onClick,
}: {
  plan: RecommendedPlan;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-colors cursor-pointer ${
        selected
          ? 'border-brand-promo-primary bg-brand-promo-primary/5'
          : 'border-border bg-white hover:bg-surface-page'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-body font-semibold text-fg-primary">
          {plan.planName}
        </span>
        <span className="text-body font-bold text-brand-promo-secondary">
          월 {plan.monthlyFee?.toLocaleString()}원
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-fg-secondary">
        {plan.data && <span>데이터 {plan.data}</span>}
        {plan.voice && <span>음성 {plan.voice}</span>}
        {plan.message && <span>메시지 {plan.message}</span>}
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-caption text-brand-promo-primary">
          <Check size={14} />
          선택됨
        </div>
      )}
    </button>
  );
}

export default function PlanSubscriptionSheet({
  open,
  onOpenChange,
  plan,
  onComplete,
}: PlanSubscriptionSheetProps) {
  const [step, setStep] = useState<SubscriptionStep>(
    plan ? 'confirm' : 'planSelect',
  );
  const [selectedPlan, setSelectedPlan] = useState<RecommendedPlan | null>(
    plan,
  );
  const [form, setForm] = useState<SubscriptionForm>(initialForm);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // 요금제 카탈로그 — TanStack Query로 캐싱·로딩·에러 상태 관리
  const {
    data: planList = [],
    isLoading: isPlanListLoading,
    error: planListError,
  } = usePlanCatalog();

  // 가입 신청 뮤테이션 — 성공 시 현재 요금제 캐시 자동 무효화
  const submitMutation = useSubmitSubscription();
  const isSubmitting = submitMutation.isPending;
  const submitError = submitMutation.error
    ? submitMutation.error instanceof Error
      ? submitMutation.error.message
      : '가입 신청 중 문제가 발생했어요. 다시 시도해주세요.'
    : null;

  // 로그인된 사용자 정보 — 본인 입력 단계 없이 확인용으로 표시
  const user = useAuth().user;
  const userInfo = useMemo(() => {
    const meta = user?.user_metadata;
    return {
      name: (meta?.name as string) || '',
      birth: (meta?.birth as string) || '',
      phone: (meta?.phone as string) || '',
      email: user?.email || '',
    };
  }, [user]);

  const update = <K extends keyof SubscriptionForm>(
    field: K,
    value: SubscriptionForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fieldErrors = useMemo(
    () => ({
      address: form.address.length > 0 && form.address.trim().length < 5,
    }),
    [form],
  );

  const canProceed = useMemo(() => {
    switch (step) {
      case 'planSelect':
        return selectedPlan !== null;
      case 'confirm':
        return true;
      case 'delivery':
        if (form.simType === '') return false;
        // USIM은 물리 배송이 필요하므로 주소 필수, eSIM은 주소 불필요
        if (form.simType === 'usim') {
          return form.address.trim().length >= 5;
        }
        return true;
      case 'agreement':
        return form.agreedPrivacy && form.agreedService;
      default:
        return false;
    }
  }, [step, selectedPlan, form]);

  const helperText = useMemo(() => {
    switch (step) {
      case 'planSelect':
        return '가입할 요금제를 선택해주세요';
      case 'confirm':
        return '가입 유형을 선택해주세요';
      case 'delivery':
        return form.simType === 'usim'
          ? '배송 주소를 입력해주세요'
          : 'USIM 유형을 선택해주세요';
      case 'agreement':
        return '필수 약관에 모두 동의해주세요';
      default:
        return '';
    }
  }, [step, form.simType]);

  const showHelper = !canProceed && step !== 'complete';

  const handleNext = async () => {
    if (!canProceed || isSubmitting) return;

    if (step === 'agreement') {
      if (!selectedPlan) return;
      submitMutation.mutate(
        { plan: selectedPlan, form },
        {
          onSuccess: () => setStep('complete'),
        },
      );
      return;
    }

    const order: SubscriptionStep[] = [
      'planSelect',
      'confirm',
      'delivery',
      'agreement',
    ];
    const index = order.indexOf(step);
    setStep(order[index + 1] ?? 'complete');
  };

  const handlePrev = () => {
    const order: SubscriptionStep[] = [
      'planSelect',
      'confirm',
      'delivery',
      'agreement',
    ];
    const index = order.indexOf(step);
    setStep(order[Math.max(0, index - 1)] ?? 'planSelect');
  };

  const allAgreed =
    form.agreedPrivacy && form.agreedService && form.agreedMarketing;
  const handleAllAgree = (checked: boolean) => {
    update('agreedPrivacy', checked);
    update('agreedService', checked);
    update('agreedMarketing', checked);
  };

  const typeOptions: { value: SubscriptionType; label: string }[] = [
    { value: 'new', label: '신규 가입' },
    { value: 'change', label: '요금제 변경' },
  ];

  const title = STEP_TITLES[step].title;
  const description = useMemo(() => {
    if (step === 'confirm' && selectedPlan) {
      return `${selectedPlan.planName} · 월 ${selectedPlan.monthlyFee !== undefined ? selectedPlan.monthlyFee.toLocaleString() : '-'}원`;
    }
    return STEP_TITLES[step].desc || undefined;
  }, [step, selectedPlan]);

  const footer = (
    <div className="flex flex-col gap-2 w-full">
      {/* 단계 전환 시 높이가 흔들리지 않도록 안내 문구 영역을 항상 한 줄 확보 */}
      <p
        className={`text-center text-caption text-error ${showHelper ? '' : 'invisible'}`}
      >
        {showHelper ? helperText : '\u00A0'}
      </p>
      {submitError && (
        <p className="text-center text-caption text-error">{submitError}</p>
      )}
      <div className="flex gap-2 w-full">
        {step !== 'planSelect' && step !== 'complete' && (
          <Button
            key={`nav-prev-${step}`}
            variant="outline"
            size="md"
            className="flex-1"
            onClick={handlePrev}
            disabled={isSubmitting}
          >
            이전
          </Button>
        )}
        {step === 'complete' ? (
          <Button
            key="nav-confirm"
            size="md"
            className="flex-1"
            onClick={() => {
              onComplete?.();
              // onComplete 후 vaul 닫기 애니메이션이 정상 동작하도록 약간 지연
              setTimeout(() => onOpenChange(false), 100);
            }}
          >
            확인
          </Button>
        ) : (
          // step마다 새 DOM으로 마운트해서 이전 단계 클릭의 :active/hover 잔상 제거
          <Button
            key={`nav-next-${step}`}
            size="md"
            className="flex-1"
            disabled={!canProceed || isSubmitting}
            onClick={handleNext}
          >
            {isSubmitting
              ? '처리 중...'
              : step === 'agreement'
                ? '신청 완료'
                : '다음'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
      onBack={
        step !== 'planSelect' && step !== 'complete' ? handlePrev : undefined
      }
      size={step === 'complete' ? 'content' : 'large'}
    >
      <div className="space-y-5 pb-2">
        <StepIndicator current={step} onChange={setStep} />

        {step === 'planSelect' && (
          <section className="space-y-4">
            <p className="text-body-sm text-fg-secondary">
              가입하실 요금제를 아래에서 선택해주세요.
            </p>
            {isPlanListLoading && (
              <p className="text-center text-caption text-fg-tertiary py-8">
                요금제를 불러오는 중...
              </p>
            )}
            {!isPlanListLoading && planListError && (
              <p className="text-center text-caption text-semantic-error py-8">
                {planListError instanceof Error
                  ? planListError.message
                  : '요금제 목록을 불러오지 못했습니다.'}
              </p>
            )}
            {!isPlanListLoading && !planListError && planList.length === 0 && (
              <p className="text-center text-caption text-fg-tertiary py-8">
                등록된 요금제가 없습니다.
              </p>
            )}
            <div className="space-y-3">
              {planList.map((p) => (
                <PlanSelectItem
                  key={p.planId}
                  plan={p}
                  selected={p.planId === selectedPlan?.planId}
                  onClick={() => setSelectedPlan(p)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 'confirm' && selectedPlan && (
          <section className="space-y-5">
            <PlanSummary plan={selectedPlan} />
            <div>
              <h5 className="text-body font-semibold text-fg-primary mb-3">
                가입 유형을 선택해 주세요
              </h5>
              <div className="space-y-3">
                {typeOptions.map((option) => {
                  const selected = form.type === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors cursor-pointer ${
                        selected
                          ? 'border-brand-promo-primary bg-brand-promo-primary/5'
                          : 'border-border bg-white hover:bg-surface-page'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => update('type', option.value)}
                        className="size-5 shrink-0 accent-brand-promo-primary"
                      />
                      <span
                        className={`text-body-sm font-medium ${
                          selected
                            ? 'text-brand-promo-primary'
                            : 'text-fg-secondary'
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {step === 'delivery' && (
          <section className="space-y-4">
            {/* USIM 유형을 먼저 선택하고, 유심(USIM) 선택 시에만 배송 주소 표시 */}
            <div>
              <label className="text-caption text-fg-secondary mb-1.5 block">
                USIM 유형
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'usim', label: '유심(USIM)' },
                  { value: 'esim', label: 'eSIM' },
                ].map((sim) => {
                  const selected = form.simType === sim.value;
                  return (
                    <button
                      key={sim.value}
                      type="button"
                      onClick={() =>
                        update(
                          'simType',
                          sim.value as SubscriptionForm['simType'],
                        )
                      }
                      className={`rounded-2xl border p-4 text-body-sm font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'border-brand-promo-primary bg-brand-promo-primary/5 text-brand-promo-primary'
                          : 'border-border bg-white text-fg-secondary hover:bg-surface-page'
                      }`}
                    >
                      {sim.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {form.simType === 'usim' && (
              <div>
                <label className="text-caption text-fg-secondary mb-1.5 block">
                  배송 주소
                </label>
                <div className="flex gap-2">
                  <Input
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="도로명 주소를 입력해주세요"
                    variant={fieldErrors.address ? 'error' : 'default'}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="md"
                    type="button"
                    disabled
                    className="shrink-0"
                  >
                    도로명 검색
                  </Button>
                </div>
                <Input
                  value={form.addressDetail}
                  onChange={(e) => update('addressDetail', e.target.value)}
                  placeholder="상세 주소"
                  variant={fieldErrors.address ? 'error' : 'default'}
                  className="mt-2"
                />
                {fieldErrors.address && (
                  <p className="mt-1 text-caption text-error">
                    주소를 5자 이상 입력해주세요
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {step === 'agreement' && (
          <section className="space-y-4">
            {/* 본인정보 확인 패널 — 로그인된 사용자 정보를 읽기 전용으로 표시 */}
            <div className="rounded-2xl border border-border bg-surface-page p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h6 className="text-body-sm font-semibold text-fg-primary">
                  신청자 정보 확인
                </h6>
                <span className="text-caption text-semantic-success font-medium">
                  본인 인증 완료
                </span>
              </div>
              <div className="text-body-sm text-fg-secondary space-y-1">
                <InfoRow label="이름" value={userInfo.name || '-'} />
                <InfoRow label="휴대폰" value={userInfo.phone || '-'} />
                <InfoRow label="이메일" value={userInfo.email || '-'} />
              </div>
              <p className="text-caption text-fg-tertiary">
                로그인된 계정 정보가 자동 적용되었습니다. 정보가 다르다면
                마이페이지에서 수정 후 신청해 주세요.
              </p>
            </div>

            <p className="text-body-sm text-fg-secondary">
              아래 약관에 동의해 주세요.
            </p>
            <label className="flex items-start gap-3 rounded-2xl border border-border-brand bg-brand-promo-primary/5 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => handleAllAgree(e.target.checked)}
                className="mt-1 accent-brand-promo-primary"
              />
              <span className="text-body-sm font-semibold text-fg-primary">
                모두 동의합니다
              </span>
            </label>
            <div className="h-px bg-border" />

            <TermAccordion
              termKey="privacy"
              label="[필수] 개인정보 수집 및 이용 동의"
              checked={form.agreedPrivacy}
              onCheck={(v) => update('agreedPrivacy', v)}
              expanded={expandedTerm === 'privacy'}
              onToggle={() =>
                setExpandedTerm(expandedTerm === 'privacy' ? null : 'privacy')
              }
            >
              에피라통신(주)은 요금제 가입 신청 처리를 위해 아래의 개인정보를
              수집·이용합니다.
              {'\n\n'}- 수집 항목: 이름, 휴대폰 번호, 이메일, 배송 주소(USIM
              선택 시){'\n'}- 이용 목적: 가입 신청 접수, USIM 배송, 요금제 개통
              안내{'\n'}- 보유 기간: 가입 신청 완료 후 1년간 보관 후 파기
              {'\n\n'}
              동의를 거부할 수 있으나, 거부 시 요금제 가입 신청이 불가능합니다.
            </TermAccordion>

            <TermAccordion
              termKey="service"
              label="[필수] 통신 서비스 이용 약관 동의"
              checked={form.agreedService}
              onCheck={(v) => update('agreedService', v)}
              expanded={expandedTerm === 'service'}
              onToggle={() =>
                setExpandedTerm(expandedTerm === 'service' ? null : 'service')
              }
            >
              제1조(목적) 본 약관은 에피라통신(주)이 제공하는 이동통신 서비스의
              이용 조건 및 절차, 당사자 간 권리·의무·책임을 규정합니다.
              {'\n\n'}
              제2조(서비스 제공) 당사는 가입 신청 접수 후 순차에 따라 서비스를
              개통하며, 개통 예정일은 별도로 안내합니다.
              {'\n\n'}
              제3조(요금) 월 정액 요금은 선택한 요금제 기준이며, 부가세 포함
              여부는 요금제 안내를 따릅니다.
            </TermAccordion>

            <TermAccordion
              termKey="marketing"
              label="[선택] 마케팅 정보 수신 동의"
              checked={form.agreedMarketing}
              onCheck={(v) => update('agreedMarketing', v)}
              expanded={expandedTerm === 'marketing'}
              onToggle={() =>
                setExpandedTerm(
                  expandedTerm === 'marketing' ? null : 'marketing',
                )
              }
            >
              에피라통신(주)의 신규 요금제, 프로모션, 혜택 정보를 SMS·이메일로
              수신하실 수 있습니다. 동의하지 않아도 가입 신청에 영향이 없으며,
              언제든지 마이페이지에서 철회할 수 있습니다.
            </TermAccordion>
          </section>
        )}

        {step === 'complete' && selectedPlan && (
          <section className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 size={48} className="text-semantic-success" />
            <div>
              <h5 className="text-title font-bold text-fg-primary">
                {form.type === 'change' ? '요금제 변경' : '요금제 가입'}이
                완료되었어요
              </h5>
              <p className="text-body-sm text-fg-secondary mt-1">
                {selectedPlan.planName} · 월{' '}
                {selectedPlan.monthlyFee !== undefined
                  ? selectedPlan.monthlyFee.toLocaleString()
                  : '-'}
                원
              </p>
            </div>
            <div className="w-full rounded-2xl bg-surface-page p-4 text-body-sm text-fg-secondary space-y-2 text-left">
              <InfoRow label="이름" value={userInfo.name || '-'} />
              <InfoRow label="휴대폰" value={userInfo.phone || '-'} />
              <InfoRow label="이메일" value={userInfo.email || '-'} />
              {form.simType === 'usim' && (
                <InfoRow
                  label="주소"
                  value={
                    form.address +
                    (form.addressDetail ? ` ${form.addressDetail}` : '')
                  }
                />
              )}
              <InfoRow
                label="가입 유형"
                value={
                  typeOptions.find((t) => t.value === form.type)?.label ?? ''
                }
              />
              <InfoRow label="USIM" value={form.simType.toUpperCase()} />
            </div>
          </section>
        )}
      </div>
    </BottomSheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-fg-tertiary">{label}</span>
      <span className="font-medium text-fg-primary">{value}</span>
    </div>
  );
}

function TermAccordion({
  label,
  checked,
  onCheck,
  expanded,
  onToggle,
  children,
}: {
  termKey: string;
  label: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          className="mt-0 shrink-0 accent-brand-promo-primary"
        />
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between text-left cursor-pointer"
        >
          <span className="text-body-sm text-fg-secondary">
            <span className="font-medium text-fg-primary">
              {label.split(' ')[0]}
            </span>{' '}
            {label.split(' ').slice(1).join(' ')}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-fg-tertiary transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border bg-surface-page px-4 py-3">
          <pre className="whitespace-pre-wrap text-caption text-fg-tertiary font-sans leading-relaxed">
            {children}
          </pre>
        </div>
      )}
    </div>
  );
}
