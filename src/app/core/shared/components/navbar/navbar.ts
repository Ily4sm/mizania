import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslatePipe, ThemeToggle, LanguageSwitcher],
  template: `
    <header class="navbar">
      <div>
        <p class="eyebrow">{{ 'APP.NAME' | translate }}</p>
        <h1>{{ 'APP.TAGLINE' | translate }}</h1>
      </div>

      <div class="actions">
        <app-language-switcher />
        <app-theme-toggle />
      </div>
    </header>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .eyebrow {
      margin: 0 0 4px;
      color: var(--primary);
      font-weight: 900;
      letter-spacing: -0.03em;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.2rem, 4vw, 1.8rem);
      letter-spacing: -0.04em;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `,
})
export class Navbar {}