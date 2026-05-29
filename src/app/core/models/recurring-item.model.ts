import { TransactionType } from './transaction.model';

export interface RecurringItem {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface CreateRecurringItemPayload {
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  icon: string;
}

export interface UpdateRecurringItemPayload {
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  icon: string;
  is_active: boolean;
}