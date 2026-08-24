import { useState } from 'react';

import { Button } from '@/features/shared';
import type { ConsultForm, ConsultInput } from '@/lib/aiConsult';

const PRIORITY_LABELS: Record<string, string> = {
  budget: '가격 우선',
  data: '데이터 용량 우선',
  max_data: '최대 데이터',
};

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

  const handleText = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumber = (name: string, value: string) => {
    const numberValue = value === '' ? '' : Number(value);
    setValues((prev) => ({ ...prev, [name]: numberValue }));
  };

  const handleOttToggle = (name: string, option: string) => {
    setValues((prev) => {
      const selected = (prev[name] as string[]) ?? [];
      return selected.includes(option)
        ? { ...prev, [name]: selected.filter((o) => o !== option) }
        : { ...prev, [name]: [...selected, option] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      {form.fields.map((field) => (
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
              className="w-full h-[45px] px-4 rounded-full border border-border bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled"
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
              className="w-full h-[45px] px-4 rounded-full border border-border bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled"
            />
          )}

          {field.type === 'text' && (
            <input
              type="text"
              value={String(values[field.name] ?? '')}
              onChange={(e) => handleText(field.name, e.target.value)}
              disabled={disabled}
              className="w-full h-[45px] px-4 rounded-full border border-border bg-surface-card text-fg-primary outline-none focus:border-brand-promo-primary disabled:bg-surface-pressed disabled:text-fg-disabled"
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
                      onChange={() => handleOttToggle(field.name, option)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <Button type="submit" disabled={disabled} size="md" className="w-full">
        추천 받기
      </Button>
    </form>
  );
}
