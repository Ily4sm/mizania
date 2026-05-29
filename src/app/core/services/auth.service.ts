import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createMizaniaSupabaseClient } from '../supabase/supabase.client';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly isBrowser: boolean;
  private supabase: SupabaseClient | null = null;

  user = signal<User | null>(null);
  session = signal<Session | null>(null);
  loading = signal<boolean>(true);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      this.loading.set(false);
      return;
    }

    this.supabase = createMizaniaSupabaseClient();
    this.loadSession();

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client is only available in the browser.');
    }

    return this.supabase;
  }

  async register(payload: RegisterPayload): Promise<void> {
    const client = this.getSupabaseClient();

    const { error } = await client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    });

    if (error) {
      throw error;
    }
  }

  async login(payload: LoginPayload): Promise<void> {
    const client = this.getSupabaseClient();

    const { error } = await client.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    const client = this.getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      throw error;
    }

    this.session.set(null);
    this.user.set(null);
  }

  async getSession(): Promise<Session | null> {
    if (!this.isBrowser) {
      return null;
    }

    const client = this.getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      return null;
    }

    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);

    return data.session;
  }

  private async loadSession(): Promise<void> {
    try {
      await this.getSession();
    } finally {
      this.loading.set(false);
    }
  }
}