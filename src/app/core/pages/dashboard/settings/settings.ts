import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLanguage, LanguageService } from '../../../services/language.service';
import { ProfileService } from '../../../services/profile.service';
import { ThemeMode, ThemeService } from '../../../services/theme.service';

type AlertType = 'success' | 'error';

interface PageAlert {
  type: AlertType;
  message: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  private alertTimeoutId: number | null = null;

  alert = signal<PageAlert | null>(null);
  loading = signal(false);

  profile = this.profileService.profile;

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
    preferred_language: ['fr' as AppLanguage, [Validators.required]],
    theme: ['light' as ThemeMode, [Validators.required]],
    currency: ['MAD', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const profile = await this.profileService.loadMyProfile();

    if (!profile) {
      return;
    }

    this.form.patchValue({
      full_name: profile.full_name,
      email: profile.email,
      preferred_language: profile.preferred_language,
      theme: profile.theme,
      currency: profile.currency,
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    this.loading.set(true);

    try {
      const value = this.form.getRawValue();

      await this.profileService.updateProfile({
        full_name: value.full_name.trim(),
        preferred_language: value.preferred_language,
        theme: value.theme,
        currency: value.currency.trim().toUpperCase(),
      });

      this.languageService.setLanguage(value.preferred_language);
      this.themeService.setTheme(value.theme);

      this.showAlert('success', 'Settings saved successfully.');
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private showAlert(type: AlertType, message: string): void {
    if (this.alertTimeoutId) {
      window.clearTimeout(this.alertTimeoutId);
    }

    this.alert.set({ type, message });

    this.alertTimeoutId = window.setTimeout(() => {
      this.alert.set(null);
      this.alertTimeoutId = null;
    }, 3500);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong.';
  }
}