import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  HelpCircle,
  Lightbulb,
  LucideAngularModule,
  Mail,
  MessageSquare,
  Send,
  TriangleAlert,
} from 'lucide-angular';
import {
  SupportMessageType,
  SupportService,
} from '../../../services/support.service';
import { ProfileService } from '../../../services/profile.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  AppSelect,
  AppSelectOption,
} from '../../../shared/components/app-select/app-select';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, LucideAngularModule, AppSelect],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class Support implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);
  private readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  readonly icons = {
    send: Send,
    mail: Mail,
    message: MessageSquare,
    suggestion: Lightbulb,
    problem: TriangleAlert,
    question: HelpCircle,
  };

  loading = signal(false);

  form = this.fb.nonNullable.group({
    type: ['suggestion' as SupportMessageType, [Validators.required]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
  });

  async ngOnInit(): Promise<void> {
    const profile = await this.profileService.loadMyProfile();

    if (!profile) return;

    this.form.patchValue({
      email: profile.email,
    });
  }

  get typeOptions(): AppSelectOption[] {
    return [
      {
        label: this.t('SUPPORT.TYPE_SUGGESTION'),
        value: 'suggestion',
      },
      {
        label: this.t('SUPPORT.TYPE_PROBLEM'),
        value: 'problem',
      },
      {
        label: this.t('SUPPORT.TYPE_QUESTION'),
        value: 'question',
      },
    ];
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
      const profile = this.profileService.profile();

      await this.supportService.sendMessage({
        type: value.type,
        subject: value.subject.trim(),
        message: value.message.trim(),
        email: value.email.trim(),
        fullName: profile?.full_name,
      });

      this.toastService.success(
        this.t('SUPPORT.SENT_TOAST_TITLE'),
        this.t('SUPPORT.SENT_TOAST_MESSAGE')
      );

      this.form.patchValue({
        type: 'suggestion',
        subject: '',
        message: '',
      });
    } catch (error) {
      this.toastService.error(
        this.t('SUPPORT.FAILED_TOAST_TITLE'),
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
    if (error instanceof Error) return error.message;

    return this.t('COMMON.SOMETHING_WENT_WRONG');
  }
}