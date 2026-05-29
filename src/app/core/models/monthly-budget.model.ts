export interface MonthlyBudget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface CreateMonthlyBudgetPayload {
  category_id: string;
  month: string;
  limit_amount: number;
}

export interface UpdateMonthlyBudgetPayload {
  category_id: string;
  month: string;
  limit_amount: number;
}

export interface BudgetProgress {
  budget: MonthlyBudget;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}