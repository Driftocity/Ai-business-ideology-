export interface UserData {
  idea: string;
  industry: string;
  budget: string;
  customer: string;
  problem: string;
  validation?: string;
  market?: string;
  fullPlan?: string;
  isPaid?: boolean;
}

export type StepNumber = 1 | 2 | 3 | 4;

export interface PlanSection {
  title: string;
  content: string;
}
