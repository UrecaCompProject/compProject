export interface PlanDetailItem {
  id: string;
  name: string;
  category: string;
  targetAge: string;
  dataTier: string;
  monthlyFee: number;
  data: string;
  dataSpeedAfter: string;
  voice: string;
  callAmountMin: number | null;
  message: string;
  smsAmount: number | null;
  shareData: string;
  tethering: string;
  notes: string;
  benefits: string[];
  ottBenefits: string[];
  addOns: string[];
  contractPeriodMonths: number | null;
  couponText?: string | null;
}
