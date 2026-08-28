interface TabOption<T extends string> {
  label: string;
  value: T;
}

interface TabProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function Tab<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: TabProps<T>) {
  return (
    <div className={`flex ${className}`}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 border-b-2 pb-2.5 text-body text-center transition-colors cursor-pointer ${
              isActive
                ? 'border-brand-primary text-brand-primary font-bold'
                : 'border-transparent text-fg-tertiary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
