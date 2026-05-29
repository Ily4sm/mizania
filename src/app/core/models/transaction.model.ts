export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
}

export interface CreateTransactionPayload {
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  transaction_date: string;
}

export interface UpdateTransactionPayload {
  category_id: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  transaction_date: string;
}