import {
  Database,
  Gift,
  MessageSquare,
  Phone,
  Repeat,
  Sparkles,
  Wifi,
} from 'lucide-react';

import { Card, IconListItem } from '@/shared';
import type { IconBadgeColor } from '@/shared';

import type { PlanDetailItem } from '../types';
import type { LucideIcon } from 'lucide-react';

interface InfoRowData {
  icon: LucideIcon;
  title: string;
  description?: string;
  badgeColor?: IconBadgeColor;
}

function InfoGroupCard({ rows }: { rows: InfoRowData[] }) {
  return (
    <Card border="default" radius="16" gap="16">
      {rows.map((row) => (
        <IconListItem
          key={row.title}
          icon={row.icon}
          label={row.title}
          description={row.description}
          variant="badge"
          badgeColor={row.badgeColor}
          badgeSize={28}
          gapClassName="gap-3"
          textClassName="text-body font-semibold text-fg-primary"
          descriptionClassName="text-caption text-fg-tertiary"
        />
      ))}
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
      <section className="flex flex-col gap-2.5">
        <h3 className="text-[16px] font-semibold text-fg-secondary">
          Plan Info
        </h3>
        <InfoGroupCard
          rows={[
            {
              icon: Database,
              title: `데이터 ${plan.data}${plan.dataSpeedAfter ? ` + ${plan.dataSpeedAfter} 무제한` : ''}`,
              description: plan.notes,
            },
            { icon: Wifi, title: '테더링', description: plan.tethering },
            {
              icon: Repeat,
              title: '데이터 공유',
              description: plan.shareData,
            },
          ]}
        />
      </section>

      {allBenefits.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-[16px] font-semibold text-fg-secondary">
            Plan Benefits
          </h3>
          <div className="flex flex-col gap-2.5">
            {allBenefits.map((benefit, index) => (
              <Card
                key={benefit}
                border="default"
                radius="16"
                gap="8"
                className="flex-row items-center"
              >
                <IconListItem
                  icon={BENEFIT_ICONS[index % BENEFIT_ICONS.length]}
                  label={benefit}
                  variant="badge"
                  badgeSize={28}
                  gapClassName="gap-3"
                  textClassName="text-body font-semibold text-fg-primary"
                />
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2.5">
        <h3 className="text-[16px] font-semibold text-fg-secondary">Telecom</h3>
        <InfoGroupCard
          rows={[
            {
              icon: Phone,
              title: '음성통화',
              description: plan.callAmountMin
                ? `기본 제공 (월 ${plan.callAmountMin}분)`
                : plan.voice,
              badgeColor: 'accent-purple',
            },
            {
              icon: MessageSquare,
              title: '메시지',
              description: plan.smsAmount
                ? `기본 제공 (월 ${plan.smsAmount}건)`
                : plan.message,
              badgeColor: 'accent-primary',
            },
          ]}
        />
      </section>

      {plan.notes && (
        <p className="-mt-2 mb-4 text-[12px] font-normal text-fg-tertiary">
          · {plan.notes}
        </p>
      )}
    </div>
  );
}
