import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly authService = inject(AuthService);
  private readonly isBrowser: boolean;

  categories = signal<Category[]>([]);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadCategories(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.loading.set(true);

    try {
      const client = this.authService.getSupabaseClient();

      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.categories.set((data ?? []) as Category[]);
    } finally {
      this.loading.set(false);
    }
  }

  async createCategory(payload: CreateCategoryPayload): Promise<void> {
    const client = this.authService.getSupabaseClient();
    const session = await this.authService.getSession();

    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await client.from('categories').insert({
      user_id: session.user.id,
      name: payload.name.trim(),
      type: payload.type,
      icon: payload.icon,
      color: payload.color,
    });

    if (error) {
      throw error;
    }

    await this.loadCategories();
  }

  async updateCategory(
    categoryId: string,
    payload: UpdateCategoryPayload
  ): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client
      .from('categories')
      .update({
        name: payload.name.trim(),
        type: payload.type,
        icon: payload.icon,
        color: payload.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId);

    if (error) {
      throw error;
    }

    await this.loadCategories();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const client = this.authService.getSupabaseClient();

    const { error } = await client.from('categories').delete().eq('id', categoryId);

    if (error) {
      throw error;
    }

    await this.loadCategories();
  }
}