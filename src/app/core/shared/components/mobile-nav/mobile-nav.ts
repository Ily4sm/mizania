import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-nav">
      <a routerLink="/dashboard" routerLinkActive="active">📊</a>
      <a routerLink="/budgets" routerLinkActive="active">🎯</a>
      <a routerLink="/transactions" routerLinkActive="active">💸</a>
      <a routerLink="/categories" routerLinkActive="active">🏷️</a>
      <a routerLink="/recurring-items" routerLinkActive="active">🔁</a>
      <a routerLink="/settings" routerLinkActive="active">⚙️</a>
    </nav>
  `,
  styles: `
    .mobile-nav {
      position: fixed;
      left: 14px;
      right: 14px;
      bottom: 14px;
      z-index: 20;
      display: none;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface) 92%, transparent);
      backdrop-filter: blur(18px);
      box-shadow: var(--shadow);
    }

    a {
      height: 44px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--muted);
    }

    a.active {
      background: var(--surface-soft);
      color: var(--text);
    }

    @media (max-width: 900px) {
      .mobile-nav {
        display: grid;
      }
    }
  `,
})
export class MobileNav {}