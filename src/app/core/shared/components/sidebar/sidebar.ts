import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">M</div>
        <div>
          <strong>Mizania</strong>
          <span>Budget manager</span>
        </div>
      </div>

      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">
          <span>📊</span>
          {{ 'NAV.DASHBOARD' | translate }}
        </a>

        <a routerLink="/budgets" routerLinkActive="active">
          <span>🎯</span>
          {{ 'NAV.BUDGETS' | translate }}
        </a>

        <a routerLink="/transactions" routerLinkActive="active">
          <span>💸</span>
          {{ 'NAV.TRANSACTIONS' | translate }}
        </a>

        <a routerLink="/categories" routerLinkActive="active">
          <span>🏷️</span>
          {{ 'NAV.CATEGORIES' | translate }}
        </a>

        <a routerLink="/recurring-items" routerLinkActive="active">
          <span>🔁</span>
          {{ 'NAV.RECURRING' | translate }}
        </a>

        <a routerLink="/settings" routerLinkActive="active">
          <span>⚙️</span>
          {{ 'NAV.SETTINGS' | translate }}
        </a>
      </nav>
    </aside>
  `,
  styles: `
    .sidebar {
      position: sticky;
      top: 20px;
      height: calc(100vh - 40px);
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 28px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
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

    .brand strong {
      display: block;
      font-size: 1.1rem;
    }

    .brand span {
      display: block;
      color: var(--muted);
      font-size: 0.8rem;
    }

    nav {
      display: grid;
      gap: 8px;
    }

    a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 14px;
      border-radius: 16px;
      color: var(--muted);
      font-weight: 800;
      transition: 0.2s ease;
    }

    a:hover,
    a.active {
      background: var(--surface-soft);
      color: var(--text);
    }

    @media (max-width: 900px) {
      .sidebar {
        display: none;
      }
    }
  `,
})
export class Sidebar {}