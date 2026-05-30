import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ArrowLeft, LucideAngularModule, MailQuestion } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  readonly icons = {
    mailQuestion: MailQuestion,
    back: ArrowLeft,
  };

  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

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
      const email = this.form.getRawValue().email.trim();

      await this.authService.sendPasswordResetEmail(email);

      this.form.reset({
        email: '',
      });

      this.toastService.success(
        this.t('AUTH.RESET_EMAIL_SENT_TITLE'),
        this.t('AUTH.RESET_EMAIL_SENT_MESSAGE')
      );

      setTimeout(() => {
        this.router.navigateByUrl('/auth/login');
      }, 1600);
    } catch (error) {
      this.toastService.error(
        this.t('AUTH.RESET_EMAIL_FAILED_TITLE'),
        this.getErrorMessage(error)
      );
    } finally {
      this.loading.set(false);
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