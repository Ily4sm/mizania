import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  CreateRecurringItemPayload,
  RecurringItem,
  UpdateRecurringItemPayload,
} from '../models/recurring-item.model';
import { CreateTransactionPayload } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class RecurringItemService {
  private readonly authService = inject(AuthService);
  private readonly transactionService = inject(TransactionService);
  private readonly isBrowser: boolean;

  recurringItems = signal<RecurringItem[]>([]);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadRecurringItems(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.loading.set(true);

    try {
      const client = this.authService.getSupabaseClient();

      const { data, error } = await client
        .from('recurring_items')
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
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.recurringItems.set((data ?? []) as RecurringItem[]);
    } finally {
      this.loading.set(false);
    }
  }

  async createRecurringItem(payload: CreateRecurringItemPayload): Promise<void> {
    const client = this.authService.getSupabaseClient();
    const session = await this.authService.getSession();

    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await client.from('recurring_items').insert({
      user_id: session.user.id,
      category_id: payload.category_id,
      type: payload.type,
      title: payload.title.trim(),
      amount: payload.amount,
      note: payload.note,
      icon: payload.icon,
    });

    if (error) {
      throw error;
    }

    await this.loadRecurringItems();
  }

  async updateRecurringItem(
    itemId: string,
    payload: UpdateRecurringItemPayload
  ): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('recurring_items')
      .update({
        category_id: payload.category_id,
        type: payload.type,
        title: payload.title.trim(),
        amount: payload.amount,
        note: payload.note,
        icon: payload.icon,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    await this.loadRecurringItems();
  }

  async deleteRecurringItem(itemId: string): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client.from('recurring_items').delete().eq('id', itemId);

    if (error) {
      throw error;
    }

    await this.loadRecurringItems();
  }

  async addAsTransaction(item: RecurringItem): Promise<void> {
    const payload: CreateTransactionPayload = {
      category_id: item.category_id,
      type: item.type,
      title: item.title,
      amount: Number(item.amount),
      note: item.note,
      transaction_date: new Date().toISOString().slice(0, 10),
    };

    await this.transactionService.createTransaction(payload);
  }
}