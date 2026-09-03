import { useState } from 'react';

import { Button } from '@/shared';
import type { ConsultForm, ConsultInput } from '@/shared/lib/aiConsult';

import {
  BUDGET_BUCKETS,
  DATA_USAGE_BUCKETS,
  findBucketLabel,
  NO_PREFERENCE,
  PRIORITY_LABELS,
} from '../constants/consultBuckets';

// 나이 필드에서 "무관"을 고르면 서버가 "값 없음"으로 취급하는 사실 값을 그대로 제출한다.
const AGE_NO_PREFERENCE = '미제공';
const AGE_NO_PREFERENCE_LABEL = '무관';

function NumberBucketGroup({
  buckets,
  value,
  onSelect,
  disabled,
}: {
  buckets: { label: string; value: number | string }[];
  value: number | string;
  onSelect: (value: number | string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {buckets.map((bucket) => (
        <Button
          key={bucket.label}
          type="button"
          variant="chip"
          size="chip"
          active={bucket.value === value}
          aria-pressed={bucket.value === value}
          disabled={disabled}
          onClick={() => onSelect(bucket.value)}
        >
          {bucket.label}
        </Button>
      ))}
    </div>
  );
}

// 받침 유무에 따른 조사 선택 — "나이"는 받침 없음 → "를", "예산"은 받침 있음 → "을"
function josa(word: string, tail: string): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  const hasJong = code % 28 !== 0;
  return word + (hasJong ? tail[0] : tail[2]);
}

interface RecommendationFormProps {
  form: ConsultForm;
  onSubmit: (values: Partial<ConsultInput>, summary: string) => void;
  defaultValues?: Partial<ConsultInput>;
  disabled?: boolean;
}

export default function RecommendationForm({
  form,
  onSubmit,
  defaultValues,
  disabled = false,
}: RecommendationFormProps) {
  const [values, setValues] = useState<
    Record<string, string | number | string[]>
  >(() => {
    const initial: Record<string, string | number | string[]> = {};
    for (const field of form.fields) {
      const key = field.name;
      const raw = defaultValues?.[key as keyof ConsultInput];
      if (field.type === 'number') {
        initial[key] = typeof raw === 'number' ? raw : '';
      } else if (field.type === 'multi-select') {
        initial[key] = Array.isArray(raw) ? (raw as string[]) : [];
      } else {
        initial[key] = (raw as string | undefined) ?? '';
      }
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleText = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNumberBucket = (name: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleOttToggle = (name: string, option: string) => {
    setValues((prev) => {
      const selected = (prev[name] as string[]) ?? [];
      return selected.includes(option)
        ? { ...prev, [name]: selected.filter((o) => o !== option) }
        : { ...prev, [name]: [...selected, option] };
    });
  };

  // 필수 필드 검증 — 빈 값이면 에러 메시지를 설정하고 제출을 중단
  const validateRequired = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of form.fields) {
      if (!field.required) continue;
      const value = values[field.name];
      if (field.type === 'number') {
        if (
          value === '' ||
          value === undefined ||
          (typeof value === 'number' && isNaN(value))
        ) {
          newErrors[field.name] = `${josa(field.label, '을/를')} 입력해주세요`;
        } else if (typeof value === 'number' && value <= 0) {
          newErrors[field.name] =
            `${josa(field.label, '은/는')} 0보다 커야 합니다`;
        }
      } else if (field.type === 'multi-select') {
        // multi-select는 required가 아닌 필드이므로 검증 생략
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.name] = `${josa(field.label, '을/를')} 선택해주세요`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequired()) return;
    const result: Partial<ConsultInput> = {};
    const summaryParts: string[] = [];
    // "무관/미확인" 선택은 result(실제 서버 제출값)에서는 빼고 skippedFields에 필드명만
    // 남긴다 — 서버가 "값이 없다"와 "명시적으로 무관을 골랐다"를 구분할 수 있도록.
    const skippedFields: string[] = [];
    for (const field of form.fields) {
      const key = field.name as keyof ConsultInput;
      const value = values[field.name];
      if (field.type === 'number') {
        if (value === NO_PREFERENCE) {
          skippedFields.push(field.name);
          summaryParts.push(
            `${field.label}: ${field.name === 'budget' ? '무관' : '미확인'}`,
          );
        } else {
          const number = typeof value === 'number' ? value : Number(value);
          if (!isNaN(number)) {
            (result as Record<string, unknown>)[key] = number;
            const buckets =
              field.name === 'budget' ? BUDGET_BUCKETS : DATA_USAGE_BUCKETS;
            // 사용자가 실제로 고른 건 대표값(정수)이 아니라 "5GB ~ 10GB" 같은 구간이므로,
            // 채팅 로그·레포트에는 대표값이 아니라 그 구간 라벨이 그대로 남게 한다.
            const bucketLabel = findBucketLabel(buckets, number);
            summaryParts.push(
              `${field.label}: ${
                bucketLabel ??
                (field.name === 'budget'
                  ? `${number.toLocaleString()}원`
                  : `${number}GB`)
              }`,
            );
          }
        }
      } else if (field.type === 'multi-select') {
        const selected = (value as string[]) ?? [];
        (result as Record<string, unknown>)[key] = selected;
        if (selected.length > 0) {
          summaryParts.push(`${field.label}: ${selected.join(', ')}`);
        }
      } else if (typeof value === 'string' && value.trim()) {
        if (value === AGE_NO_PREFERENCE) {
          skippedFields.push(field.name);
          summaryParts.push(`${field.label}: ${AGE_NO_PREFERENCE_LABEL}`);
        } else {
          (result as Record<string, unknown>)[key] = value.trim();
          summaryParts.push(
            `${field.label}: ${PRIORITY_LABELS[value] ?? value}`,
          );
        }
      }
    }
    if (skippedFields.length > 0) {
      result.skippedFields = skippedFields;
    }
    onSubmit(result, summaryParts.join(' / '));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 bg-surface-page rounded-2xl p-4 border border-border mx-4"
    >
      {form.title && (
        <h4 className="text-body-lg font-semibold text-fg-primary">
          {form.title}
        </h4>
      )}
      {form.fields.map((field, index) => {
        const hasError = !!errors[field.name];
        const errorBorder = hasError
          ? 'border-semantic-error'
          : 'border-border';
        return (
          <div key={field.name} className="flex flex-col gap-3">
            {index > 0 && <div className="h-px bg-border" />}

            <h4 className="text-body font-semibold text-fg-primary">
              {field.label}
              {field.required && (
                <span className="text-brand-promo-primary ml-1">*</span>
              )}
            </h4>

            {field.type === 'select' && (
              <div className="flex flex-wrap gap-2">
                {(field.name === 'ageGroup'
                  ? [...(field.options ?? []), AGE_NO_PREFERENCE]
                  : (field.options ?? [])
                ).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant="chip"
                    size="chip"
                    active={values[field.name] === option}
                    aria-pressed={values[field.name] === option}
                    disabled={disabled}
                    onClick={() => handleText(field.name, option)}
                  >
                    {option === AGE_NO_PREFERENCE
                      ? AGE_NO_PREFERENCE_LABEL
                      : (PRIORITY_LABELS[option] ?? option)}
                  </Button>
                ))}
              </div>
            )}

            {field.type === 'number' && (
              <NumberBucketGroup
                buckets={
                  field.name === 'budget' ? BUDGET_BUCKETS : DATA_USAGE_BUCKETS
                }
                value={values[field.name] as number | string}
                onSelect={(value) => handleNumberBucket(field.name, value)}
                disabled={disabled}
              />
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={String(values[field.name] ?? '')}
                onChange={(e) => handleText(field.name, e.target.value)}
                disabled={disabled}
                className={`w-full h-11.25 px-4 rounded-full border ${errorBorder} bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled`}
              />
            )}

            {field.type === 'multi-select' && (
              <div className="flex flex-wrap gap-2">
                {field.options?.map((option) => {
                  const selected = (
                    (values[field.name] as string[]) ?? []
                  ).includes(option);
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant="chip"
                      size="chip"
                      active={selected}
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => handleOttToggle(field.name, option)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            )}

            {hasError && (
              <p className="text-caption text-error">{errors[field.name]}</p>
            )}
          </div>
        );
      })}
      <Button type="submit" disabled={disabled} size="md" className="w-full">
        추천 받기
      </Button>
    </form>
  );
}
