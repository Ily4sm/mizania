import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  CircleCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  LucideAngularModule,
  ShieldCheck,
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  readonly icons = {
    shield: ShieldCheck,
    lock: LockKeyhole,
    success: CircleCheck,
    eye: Eye,
    eyeOff: EyeOff,
  };

  loading = signal(false);
  checking = signal(true);
  hasSession = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit(): Promise<void> {
    await this.checkResetSession();
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

    const value = this.form.getRawValue();

    if (value.password !== value.confirmPassword) {
      this.toastService.error(
        this.t('AUTH.PASSWORDS_DONT_MATCH_TITLE'),
        this.t('AUTH.PASSWORDS_DONT_MATCH_MESSAGE')
      );

      return;
    }

    this.loading.set(true);

    try {
      await this.authService.updatePassword(value.password);

      this.toastService.success(
        this.t('AUTH.PASSWORD_UPDATED_TITLE'),
        this.t('AUTH.PASSWORD_UPDATED_MESSAGE')
      );

      await this.authService.logout();
      await this.router.navigateByUrl('/auth/login');
    } catch (error) {
      this.toastService.error(
        this.t('AUTH.PASSWORD_UPDATE_FAILED_TITLE'),
        this.getErrorMessage(error)
      );
    } finally {
      this.loading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  private async checkResetSession(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const session = await this.authService.getSession();

      this.hasSession.set(!!session);
    } finally {
      this.checking.set(false);
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