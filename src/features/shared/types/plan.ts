export interface Plan {
  id: string;
  name: string;
  category: string;
  targetAge: string;
  dataTier: string;
  monthlyFee: number;
  data: string;
  dataSpeedAfter: string;
  voice: string;
  message: string;
  shareData: string;
  tethering: string;
  benefits: string[];
  notes?: string;
}
