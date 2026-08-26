import {
  Database,
  Gift,
  MessageSquare,
  Phone,
  Repeat,
  Sparkles,
  Wifi,
} from 'lucide-react';

import { Card, IconBadge } from '@/features/shared';

import type { PlanDetailItem } from '../types';
import type { LucideIcon } from 'lucide-react';

interface InfoRowProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

// Plan Info / Telecom 처럼 한 카드 안에 여러 행이 묶여야 하는 곳에서 쓰는, 자체 테두리 없는 행.
function InfoRow({ icon: Icon, title, description }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 p-4">
      <IconBadge icon={Icon} size={36} />
      <div className="flex flex-col gap-0.5">
        <p className="text-body font-semibold text-fg-primary">{title}</p>
        {description && (
          <p className="text-caption text-fg-tertiary">{description}</p>
        )}
      </div>
    </div>
  );
}

function InfoGroupCard({ rows }: { rows: InfoRowProps[] }) {
  return (
    <Card
      border="default"
      radius="16"
      gap="none"
      className="divide-y divide-border p-0"
    >
      {rows.map((row) => (
        <InfoRow key={row.title} {...row} />
      ))}
    </Card>
  );
}

// Plan Benefits는 항목마다 따로 떨어진 카드로 보여준다.
function BenefitCard({ icon, title }: InfoRowProps) {
  return (
    <Card
      border="default"
      radius="16"
      gap="8"
      className="flex-row items-center"
    >
      <IconBadge icon={icon} size={36} />
      <p className="text-body font-semibold text-fg-primary">{title}</p>
    </Card>
  );
}

const BENEFIT_ICONS: LucideIcon[] = [Gift, Sparkles];

interface PlanInfoSectionProps {
  plan: PlanDetailItem;
}

export default function PlanInfoSection({ plan }: PlanInfoSectionProps) {
  const allBenefits = [...plan.benefits, ...plan.ottBenefits, ...plan.addOns];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-title text-fg-primary">Plan Info</h3>
        <InfoGroupCard
          rows={[
            {
              icon: Database,
              title: `데이터 ${plan.data}${plan.dataSpeedAfter ? ` + ${plan.dataSpeedAfter} 무제한` : ''}`,
              description: plan.notes,
            },
            { icon: Wifi, title: '테더링', description: plan.tethering },
            { icon: Repeat, title: '데이터 공유', description: plan.shareData },
          ]}
        />
      </section>

      {allBenefits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-title text-fg-primary">Plan Benefits</h3>
          <div className="flex flex-col gap-2">
            {allBenefits.map((benefit, index) => (
              <BenefitCard
                key={benefit}
                icon={BENEFIT_ICONS[index % BENEFIT_ICONS.length]}
                title={benefit}
              />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-title text-fg-primary">Telecom</h3>
        <InfoGroupCard
          rows={[
            {
              icon: Phone,
              title: '음성통화',
              description: plan.callAmountMin
                ? `기본 제공 (월 ${plan.callAmountMin}분)`
                : plan.voice,
            },
            {
              icon: MessageSquare,
              title: '메시지',
              description: plan.smsAmount
                ? `기본 제공 (월 ${plan.smsAmount}건)`
                : plan.message,
            },
          ]}
        />
      </section>

      {plan.notes && (
        <p className="text-caption text-fg-disabled">· {plan.notes}</p>
      )}
    </div>
  );
}
