import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  BudgetProgress,
  CreateMonthlyBudgetPayload,
  MonthlyBudget,
  UpdateMonthlyBudgetPayload,
} from '../models/monthly-budget.model';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class MonthlyBudgetService {
  private readonly authService = inject(AuthService);
  private readonly transactionService = inject(TransactionService);
  private readonly isBrowser: boolean;

  budgets = signal<MonthlyBudget[]>([]);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadBudgets(month = this.getCurrentMonth()): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.loading.set(true);

    try {
      const client = this.authService.getSupabaseClient();

      const { data, error } = await client
        .from('monthly_budgets')
        .select(
          `
          *,
          categories (
            id,
            name,
            icon,
            color
          )
        `
        )
        .eq('month', month)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.budgets.set((data ?? []) as MonthlyBudget[]);
    } finally {
      this.loading.set(false);
    }
  }

  async createBudget(payload: CreateMonthlyBudgetPayload): Promise<void> {
    const client = this.authService.getSupabaseClient();
    const session = await this.authService.getSession();

    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await client.from('monthly_budgets').insert({
      user_id: session.user.id,
      category_id: payload.category_id,
      month: payload.month,
      limit_amount: payload.limit_amount,
    });

    if (error) {
      throw error;
    }

    await this.loadBudgets(payload.month);
  }

  async updateBudget(
    budgetId: string,
    payload: UpdateMonthlyBudgetPayload
  ): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('monthly_budgets')
      .update({
        category_id: payload.category_id,
        month: payload.month,
        limit_amount: payload.limit_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId);

    if (error) {
      throw error;
    }

    await this.loadBudgets(payload.month);
  }

  async deleteBudget(budgetId: string, month: string): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('monthly_budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      throw error;
    }

    await this.loadBudgets(month);
  }

  getBudgetProgress(month = this.getCurrentMonth()): BudgetProgress[] {
    const transactions = this.transactionService.transactions();
    const monthExpenses = this.getMonthExpenseTransactions(transactions, month);

    return this.budgets().map((budget) => {
      const spent = monthExpenses
        .filter((transaction) => transaction.category_id === budget.category_id)
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const limit = Number(budget.limit_amount);
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const remaining = limit - spent;

      return {
        budget,
        spent,
        remaining,
        percentage,
        status: this.getStatus(percentage),
      };
    });
  }

  getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  private getMonthExpenseTransactions(
    transactions: Transaction[],
    month: string
  ): Transaction[] {
    return transactions.filter(
      (transaction) =>
        transaction.type === 'expense' &&
        transaction.transaction_date.startsWith(month)
    );
  }

  private getStatus(percentage: number): 'safe' | 'warning' | 'danger' {
    if (percentage >= 100) {
      return 'danger';
    }

    if (percentage >= 80) {
      return 'warning';
    }

    return 'safe';
  }
}