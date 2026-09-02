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

export interface BenefitOption {
  imageUrl: string;
  label: string;
}

export interface PlanCompareData {
  currentPlanName: string;
  currentFee: string;
  currentDiscount: string;
  currentData: string;
  currentTethering: string;
  currentShareData: string;
  currentVoice: string;
  currentMessage: string;
  currentBenefits?: string[];

  selectedPlanName: string;
  selectedFee: string;
  selectedDiscount: string;
  selectedData: string;
  selectedTethering: string;
  selectedShareData: string;
  selectedVoice: string;
  selectedMessage: string;
  selectedBenefits?: string[];

  benefitRows?: {
    key: string;
    label: string;
    current: string;
    selectedSummary: string;
    selectedSubtext?: string;
    selectedOptions?: BenefitOption[];
  }[];
}
