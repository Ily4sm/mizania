import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Eye, EyeOff, LockKeyhole, LogIn, LucideAngularModule, Mail } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  readonly icons = {
    mail: Mail,
    lock: LockKeyhole,
    login: LogIn,
    eye: Eye,
    eyeOff: EyeOff,
  };

  loading = signal(false);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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
      await this.authService.login(this.form.getRawValue());

      this.toastService.success(
        this.t('AUTH.LOGIN_SUCCESS_TITLE'),
        this.t('AUTH.LOGIN_SUCCESS_MESSAGE')
      );

      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.toastService.error(
        this.t('AUTH.LOGIN_FAILED_TITLE'),
        this.getErrorMessage(error)
      );
    } finally {
      this.loading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  private t(key: string): string {
    return this.translateService.instant(key);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return this.t('AUTH.LOGIN_FAILED_MESSAGE');
  }
}