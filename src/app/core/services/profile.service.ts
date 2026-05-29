import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Profile } from '../models/profile.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly authService = inject(AuthService);
  private readonly isBrowser: boolean;

  profile = signal<Profile | null>(null);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadMyProfile(): Promise<Profile | null> {
    if (!this.isBrowser) {
      return null;
    }

    this.loading.set(true);

    try {
      const client = this.authService.getSupabaseClient();
      const session = await this.authService.getSession();

      if (!session?.user) {
        this.profile.set(null);
        return null;
      }

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        this.profile.set(data as Profile);
        return data as Profile;
      }

      const fullName =
        session.user.user_metadata?.['full_name'] ||
        session.user.email?.split('@')[0] ||
        'Utilisateur';

      const { data: createdProfile, error: createError } = await client
        .from('profiles')
        .insert({
          id: session.user.id,
          full_name: fullName,
          email: session.user.email ?? '',
          preferred_language: 'fr',
          theme: 'light',
          currency: 'MAD',
          plan: 'free',
        })
        .select('*')
        .single();

      if (createError) {
        throw createError;
      }

      this.profile.set(createdProfile as Profile);
      return createdProfile as Profile;
    } finally {
      this.loading.set(false);
    }
  }

  async updateProfile(
    payload: Partial<
      Pick<Profile, 'full_name' | 'preferred_language' | 'theme' | 'currency'>
    >
  ): Promise<void> {
    const client = this.authService.getSupabaseClient();
    const session = await this.authService.getSession();

    if (!session?.user) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await client
      .from('profiles')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      throw error;
    }

    await this.loadMyProfile();
  }
}