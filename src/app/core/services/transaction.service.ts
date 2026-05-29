import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  CreateTransactionPayload,
  Transaction,
  UpdateTransactionPayload,
} from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly authService = inject(AuthService);
  private readonly isBrowser: boolean;

  transactions = signal<Transaction[]>([]);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadTransactions(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.loading.set(true);

    try {
      const client = this.authService.getSupabaseClient();

      const { data, error } = await client
        .from('transactions')
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
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.transactions.set((data ?? []) as Transaction[]);
    } finally {
      this.loading.set(false);
    }
  }

  async createTransaction(payload: CreateTransactionPayload): Promise<void> {
    const client = this.authService.getSupabaseClient();
    const session = await this.authService.getSession();

    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await client.from('transactions').insert({
      user_id: session.user.id,
      category_id: payload.category_id,
      type: payload.type,
      title: payload.title.trim(),
      amount: payload.amount,
      note: payload.note,
      transaction_date: payload.transaction_date,
    });

    if (error) {
      throw error;
    }

    await this.loadTransactions();
  }

  async updateTransaction(
    transactionId: string,
    payload: UpdateTransactionPayload
  ): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('transactions')
      .update({
        category_id: payload.category_id,
        type: payload.type,
        title: payload.title.trim(),
        amount: payload.amount,
        note: payload.note,
        transaction_date: payload.transaction_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (error) {
      throw error;
    }

    await this.loadTransactions();
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      throw error;
    }

    await this.loadTransactions();
  }
}