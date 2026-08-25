import { useMemo, useState } from 'react';

import { Check, CheckCircle2, Smartphone } from 'lucide-react';

import { BottomSheet, Button, Input } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

import { useSubscriptionStore } from '../store/useSubscriptionStore';

type SubscriptionStep =
  'confirm' | 'identity' | 'delivery' | 'agreement' | 'complete';
type SubscriptionType = 'new' | 'portability' | 'device' | 'change';

interface FormState {
  type: SubscriptionType;
  name: string;
  birth: string;
  phone: string;
  address: string;
  simType: 'usim' | 'esim' | '';
  agreedPrivacy: boolean;
  agreedService: boolean;
  agreedMarketing: boolean;
}

const initialForm: FormState = {
  type: 'new',
  name: '',
  birth: '',
  phone: '',
  address: '',
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

function isValidBirth(birth: string) {
  if (!/^\d{6}$/.test(birth)) return false;
  const month = Number(birth.slice(2, 4));
  const day = Number(birth.slice(4, 6));
  if (month < 1 || month > 12) return false;
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/-/g, '');
  return /^\d{10,11}$/.test(digits);
}

const STEP_TITLES: Record<SubscriptionStep, string> = {
  confirm: '요금제 가입',
  identity: '본인 정보 입력',
  delivery: '배송 및 USIM 선택',
  agreement: '약관 동의',
  complete: '신청 완료',
};

const STEPS: SubscriptionStep[] = [
  'confirm',
  'identity',
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
          <button
            key={step}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onChange(step)}
            className={`flex flex-col items-center gap-1 ${
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
              {STEP_TITLES[step].split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function PlanSubscriptionSheet({
  open,
  onOpenChange,
  plan,
  onComplete,
}: PlanSubscriptionSheetProps) {
  const [step, setStep] = useState<SubscriptionStep>('confirm');
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subscribe = useSubscriptionStore((state) => state.subscribe);
  const changePlan = useSubscriptionStore((state) => state.changePlan);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 'confirm':
        return true;
      case 'identity':
        return (
          form.name.trim().length >= 2 &&
          isValidBirth(form.birth) &&
          isValidPhone(form.phone)
        );
      case 'delivery':
        return form.address.trim().length >= 5 && form.simType !== '';
      case 'agreement':
        return form.agreedPrivacy && form.agreedService;
      default:
        return false;
    }
  }, [step, form]);

  const handleNext = () => {
    if (!canProceed || isSubmitting) return;

    if (step === 'agreement') {
      setIsSubmitting(true);
      window.setTimeout(() => {
        if (plan) {
          if (form.type === 'change') {
            changePlan(plan);
          } else {
            subscribe(plan);
          }
        }
        setIsSubmitting(false);
        setStep('complete');
      }, 800);
      return;
    }

    const order: SubscriptionStep[] = [
      'confirm',
      'identity',
      'delivery',
      'agreement',
    ];
    const index = order.indexOf(step);
    setStep(order[index + 1] ?? 'complete');
  };

  const handlePrev = () => {
    const order: SubscriptionStep[] = [
      'confirm',
      'identity',
      'delivery',
      'agreement',
    ];
    const index = order.indexOf(step);
    setStep(order[Math.max(0, index - 1)] ?? 'confirm');
  };

  const description =
    step === 'confirm' && plan
      ? `${plan.planName} · 월 ${
          plan.monthlyFee !== undefined ? plan.monthlyFee.toLocaleString() : '-'
        }원`
      : undefined;

  if (!plan) return null;

  const typeOptions: { value: SubscriptionType; label: string }[] = [
    { value: 'new', label: '신규 가입' },
    { value: 'portability', label: '번호이동' },
    { value: 'device', label: '기기변경' },
    { value: 'change', label: '요금제 변경' },
  ];

  const footer = (
    <div className="flex gap-2 w-full">
      {step !== 'confirm' && step !== 'complete' && (
        <Button
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
          size="md"
          className="flex-1"
          onClick={() => {
            onComplete?.();
            onOpenChange(false);
          }}
        >
          확인
        </Button>
      ) : (
        <Button
          size="md"
          className="flex-1"
          disabled={!canProceed || isSubmitting}
          onClick={handleNext}
        >
          {step === 'agreement' ? '신청 완료' : '다음'}
        </Button>
      )}
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={STEP_TITLES[step]}
      description={description}
      footer={footer}
    >
      <div className="space-y-5 pb-2">
        <StepIndicator current={step} onChange={setStep} />
        {step === 'confirm' && (
          <section>
            <h5 className="text-body font-semibold text-fg-primary mb-3">
              가입 유형을 선택해주세요
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => {
                const selected = form.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update('type', option.value)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-colors cursor-pointer ${
                      selected
                        ? 'border-brand-promo-primary bg-brand-promo-primary/5 text-brand-promo-primary'
                        : 'border-border bg-white text-fg-secondary hover:bg-surface-page'
                    }`}
                  >
                    <Smartphone size={20} />
                    <span className="text-body-sm font-medium">
                      {option.label}
                    </span>
                    {selected && (
                      <Check size={14} className="text-brand-promo-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 'identity' && (
          <section className="space-y-4">
            <div>
              <label className="text-caption text-fg-secondary mb-1.5 block">
                이름
              </label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div>
              <label className="text-caption text-fg-secondary mb-1.5 block">
                생년월일 6자리
              </label>
              <Input
                value={form.birth}
                onChange={(e) => update('birth', e.target.value)}
                placeholder="YYMMDD"
                inputMode="numeric"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-caption text-fg-secondary mb-1.5 block">
                휴대폰 번호
              </label>
              <Input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="- 없이 입력"
                inputMode="tel"
              />
            </div>
          </section>
        )}

        {step === 'delivery' && (
          <section className="space-y-4">
            <div>
              <label className="text-caption text-fg-secondary mb-1.5 block">
                배송 주소
              </label>
              <Input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="도로명 주소를 입력해주세요"
              />
            </div>
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
                        update('simType', sim.value as FormState['simType'])
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
          </section>
        )}

        {step === 'agreement' && (
          <section className="space-y-4">
            <p className="text-body-sm text-fg-secondary">
              아래 약관에 동의해 주세요.
            </p>
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedPrivacy}
                onChange={(e) => update('agreedPrivacy', e.target.checked)}
                className="mt-1 accent-brand-promo-primary"
              />
              <span className="text-body-sm text-fg-secondary">
                <span className="font-medium text-fg-primary">[필수]</span>{' '}
                개인정보 수집 및 이용 동의
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedService}
                onChange={(e) => update('agreedService', e.target.checked)}
                className="mt-1 accent-brand-promo-primary"
              />
              <span className="text-body-sm text-fg-secondary">
                <span className="font-medium text-fg-primary">[필수]</span> 통신
                서비스 이용 약관 동의
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedMarketing}
                onChange={(e) => update('agreedMarketing', e.target.checked)}
                className="mt-1 accent-brand-promo-primary"
              />
              <span className="text-body-sm text-fg-secondary">
                <span className="font-medium text-fg-primary">[선택]</span>{' '}
                마케팅 정보 수신 동의
              </span>
            </label>
          </section>
        )}

        {step === 'complete' && (
          <section className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 size={48} className="text-semantic-success" />
            <div>
              <h5 className="text-title font-bold text-fg-primary">
                {form.type === 'change' ? '요금제 변경' : '요금제 가입'}이
                완료되었어요
              </h5>
              <p className="text-body-sm text-fg-secondary mt-1">
                {plan.planName} · 월{' '}
                {plan.monthlyFee !== undefined
                  ? plan.monthlyFee.toLocaleString()
                  : '-'}
                원
              </p>
            </div>
            <div className="w-full rounded-2xl bg-surface-page p-4 text-body-sm text-fg-secondary space-y-2 text-left">
              <InfoRow label="이름" value={form.name} />
              <InfoRow label="휴대폰" value={form.phone} />
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
