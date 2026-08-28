export interface SubscriptionForm {
  type: 'new' | 'change';
  address: string;
  addressDetail: string;
  simType: 'usim' | 'esim' | '';
  agreedPrivacy: boolean;
  agreedService: boolean;
  agreedMarketing: boolean;
}
