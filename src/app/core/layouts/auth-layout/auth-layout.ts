import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, ThemeToggle, LanguageSwitcher],
  template: `
    <main class="auth-shell">
      <section class="auth-panel">
        <div class="auth-top">
          <div class="brand">
            <div class="logo">M</div>
            <div>
              <strong>Mizania</strong>
              <span>Budget manager</span>
            </div>
          </div>

          <div class="tools">
            <app-language-switcher />
            <app-theme-toggle />
          </div>
        </div>

        <router-outlet />
      </section>
    </main>
  `,
  styles: `
    .auth-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 20px;
      background:
        radial-gradient(circle at top left, rgba(16, 185, 129, 0.18), transparent 34%),
        var(--bg);
    }

    .auth-panel {
      width: min(100%, 480px);
      padding: 24px;
      border: 1px solid var(--border);
      border-radius: 32px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .auth-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      display: grid;
      place-items: center;
      font-weight: 900;
      font-size: 1.4rem;
    }

    .brand span {
      display: block;
      color: var(--muted);
      font-size: 0.8rem;
    }

    .tools {
      display: flex;
      gap: 8px;
    }
  `,
})
export class AuthLayout {}