import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section>
      <h1 class="page-title">{{ 'AUTH.LOGIN_TITLE' | translate }}</h1>
      <p class="page-subtitle">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>

      <form class="auth-form">
        <input class="input" type="email" [placeholder]="'AUTH.EMAIL' | translate" />
        <input class="input" type="password" [placeholder]="'AUTH.PASSWORD' | translate" />

        <button class="btn btn-primary" type="button">
          {{ 'ACTIONS.LOGIN' | translate }}
        </button>
      </form>

      <p class="auth-link">
        No account?
        <a routerLink="/auth/register">Create one</a>
      </p>
    </section>
  `,
  styles: `
    .auth-form {
      display: grid;
      gap: 14px;
      margin-top: 24px;
    }

    .auth-link {
      margin-top: 18px;
      color: var(--muted);
      text-align: center;
    }

    a {
      color: var(--primary);
      font-weight: 900;
    }
  `,
})
export class Login {}