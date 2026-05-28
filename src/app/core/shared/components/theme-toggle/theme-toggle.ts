import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button class="theme-btn" type="button" (click)="themeService.toggleTheme()">
      <span>{{ themeService.theme() === 'dark' ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: `
    .theme-btn {
      width: 42px;
      height: 42px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text);
      display: grid;
      place-items: center;
      box-shadow: var(--shadow);
    }
  `,
})
export class ThemeToggle {
  themeService = inject(ThemeService);
}