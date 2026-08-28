import { useState } from 'react';

import { Button } from '@/shared';
import type { ConsultForm, ConsultInput } from '@/shared/lib/aiConsult';

const PRIORITY_LABELS: Record<string, string> = {
  budget: '가격 우선',
  data: '데이터 용량 우선',
  max_data: '최대 데이터',
};

// 받침 유무에 따른 조사 선택 — "나이"는 받침 없음 → "를", "예산"은 받침 있음 → "을"
function josa(word: string, tail: string): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  const hasJong = code % 28 !== 0;
  return word + (hasJong ? tail[0] : tail[2]);
}

interface RecommendationFormProps {
  form: ConsultForm;
  onSubmit: (values: Partial<ConsultInput>) => void;
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

  const handleNumber = (name: string, value: string) => {
    const numberValue = value === '' ? '' : Number(value);
    setValues((prev) => ({ ...prev, [name]: numberValue }));
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
    for (const field of form.fields) {
      const key = field.name as keyof ConsultInput;
      const value = values[field.name];
      if (field.type === 'number') {
        const number = typeof value === 'number' ? value : Number(value);
        if (!isNaN(number)) (result as Record<string, unknown>)[key] = number;
      } else if (field.type === 'multi-select') {
        (result as Record<string, unknown>)[key] = (value as string[]) ?? [];
      } else if (typeof value === 'string' && value.trim()) {
        (result as Record<string, unknown>)[key] = value.trim();
      }
    }
    onSubmit(result);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-surface-page rounded-2xl p-4 border border-border"
    >
      {form.title && (
        <h4 className="text-body-lg font-semibold text-fg-primary">
          {form.title}
        </h4>
      )}
      {form.fields.map((field) => {
        const hasError = !!errors[field.name];
        const errorBorder = hasError
          ? 'border-semantic-error'
          : 'border-border';
        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-body-sm font-medium text-fg-secondary">
              {field.label}
              {field.required && <span className="text-error ml-1">*</span>}
            </label>

            {field.type === 'select' && (
              <select
                value={String(values[field.name] ?? '')}
                onChange={(e) => handleText(field.name, e.target.value)}
                disabled={disabled}
                className={`w-full h-11.25 px-4 rounded-full border ${errorBorder} bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled`}
              >
                <option value="">선택해주세요</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {PRIORITY_LABELS[option] ?? option}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={values[field.name] ?? ''}
                onChange={(e) => handleNumber(field.name, e.target.value)}
                placeholder={field.name === 'budget' ? '50000' : '10'}
                disabled={disabled}
                className={`w-full h-11.25 px-4 rounded-full border ${errorBorder} bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled`}
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
                    <label
                      key={option}
                      className={`cursor-pointer inline-flex items-center px-3 py-2 rounded-full text-caption border transition-colors ${
                        selected
                          ? 'bg-brand-promo-primary text-surface-card border-brand-promo-primary'
                          : 'bg-white text-fg-tertiary border-border hover:bg-surface-pressed'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={selected}
                        onChange={(e) => {
                          handleOttToggle(field.name, option);
                          // 체크박스가 포커스를 유지하면 모바일 브라우저가
                          // 화면에 보이지 않는 sr-only 요소를 뷰포트 안으로
                          // 끌어오려 스크롤을 튕겨 페이지가 엉뚱한 위치로
                          // 점프한다. 토글 직후 바로 blur해 방지한다.
                          e.target.blur();
                        }}
                        disabled={disabled}
                        className="sr-only"
                      />
                      {option}
                    </label>
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
