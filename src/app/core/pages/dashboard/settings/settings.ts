import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { AppLanguage, LanguageService } from '../../../services/language.service';
import { ProfileService } from '../../../services/profile.service';
import { ThemeMode, ThemeService } from '../../../services/theme.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  loading = signal(false);
  profile = this.profileService.profile;

  showDeleteConfirm = false;
  deleteConfirmationText = '';
  isDeletingAccount = false;
  deleteAccountError = '';

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

    const activeLanguage = this.languageService.language();

    this.form.patchValue({
      full_name: profile.full_name,
      email: profile.email,
      preferred_language: activeLanguage,
      theme: profile.theme,
      currency: profile.currency,
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.toastService.error(
        this.t('COMMON.INVALID_FORM_TITLE'),
        this.t('COMMON.INVALID_FORM_MESSAGE')
      );

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

      this.toastService.success(
        this.t('SETTINGS.SAVED_TOAST_TITLE'),
        this.t('SETTINGS.SAVED_TOAST_MESSAGE')
      );
    } catch (error) {
      this.toastService.error(
        this.t('SETTINGS.SAVE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    } finally {
      this.loading.set(false);
    }
  }

  openDeleteAccountConfirm(): void {
    this.showDeleteConfirm = true;
    this.deleteConfirmationText = '';
    this.deleteAccountError = '';
  }

  closeDeleteAccountConfirm(): void {
    if (this.isDeletingAccount) return;

    this.showDeleteConfirm = false;
    this.deleteConfirmationText = '';
    this.deleteAccountError = '';
  }

  async confirmDeleteAccount(): Promise<void> {
    if (this.deleteConfirmationText !== 'DELETE') return;

    this.isDeletingAccount = true;
    this.deleteAccountError = '';

    try {
      await this.authService.deleteAccount();

      this.toastService.success(
        this.t('SETTINGS.ACCOUNT_DELETED_TOAST_TITLE'),
        this.t('SETTINGS.ACCOUNT_DELETED_TOAST_MESSAGE')
      );

      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error(error);

      this.deleteAccountError = 'SETTINGS.DELETE_ACCOUNT_ERROR';

      this.toastService.error(
        this.t('SETTINGS.DELETE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );

      this.isDeletingAccount = false;
    }
  }

  private t(key: string): string {
    return this.translateService.instant(key);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return this.t('COMMON.SOMETHING_WENT_WRONG');
  }
}