import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div className={`flex flex-col px-4 py-5 gap-4 bg-white ${className}`}>
      {children}
    </div>
  );
}
