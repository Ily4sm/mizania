import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section>
      <h1 class="page-title">{{ 'AUTH.FORGOT_TITLE' | translate }}</h1>
      <p class="page-subtitle">{{ 'AUTH.FORGOT_SUBTITLE' | translate }}</p>

      <form class="auth-form">
        <input class="input" type="email" [placeholder]="'AUTH.EMAIL' | translate" />
        <button class="btn btn-primary" type="button">Send reset link</button>
      </form>
    </section>
  `,
  styles: `
    .auth-form {
      display: grid;
      gap: 14px;
      margin-top: 24px;
    }
  `,
})
export class ForgotPassword {}