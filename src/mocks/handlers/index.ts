import { aiConsultHandlers } from './ai-consult';
import { authHandlers } from './auth';
import { consultReportHandlers } from './consult-report';
import { plansHandlers } from './plans';
import { rewardHandlers } from './reward';
import { subscriptionHandlers } from './subscription';
import { usageHandlers } from './usage';

export const handlers = [
  ...authHandlers,
  ...plansHandlers,
  ...usageHandlers,
  ...rewardHandlers,
  ...consultReportHandlers,
  ...subscriptionHandlers,
  ...aiConsultHandlers,
];
