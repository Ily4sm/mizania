import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="dashboard">
      <div class="hero card">
        <div>
          <h2 class="page-title">{{ 'DASHBOARD.TITLE' | translate }}</h2>
          <p class="page-subtitle">{{ 'DASHBOARD.SUBTITLE' | translate }}</p>
        </div>

        <button class="btn btn-primary">+ {{ 'ACTIONS.ADD' | translate }}</button>
      </div>

      <div class="stats-grid">
        <article class="stat-card card">
          <span>{{ 'DASHBOARD.INCOME' | translate }}</span>
          <strong>5 000 DH</strong>
          <small>+12% vs last month</small>
        </article>

        <article class="stat-card card">
          <span>{{ 'DASHBOARD.EXPENSES' | translate }}</span>
          <strong>3 200 DH</strong>
          <small>64% of income</small>
        </article>

        <article class="stat-card card">
          <span>{{ 'DASHBOARD.REMAINING' | translate }}</span>
          <strong>1 800 DH</strong>
          <small>Good margin</small>
        </article>

        <article class="stat-card card highlight">
          <span>{{ 'DASHBOARD.SAFE_DAILY' | translate }}</span>
          <strong>150 DH</strong>
          <small>12 days left</small>
        </article>
      </div>

      <div class="content-grid">
        <article class="card budget-health">
          <div>
            <span>{{ 'DASHBOARD.HEALTH' | translate }}</span>
            <strong>85/100</strong>
            <p>{{ 'DASHBOARD.GOOD' | translate }}</p>
          </div>

          <div class="circle">85%</div>
        </article>

        <article class="card quick-actions">
          <h3>{{ 'DASHBOARD.QUICK_ACTIONS' | translate }}</h3>

          <div class="quick-list">
            <button class="btn">☕ Coffee</button>
            <button class="btn">🚕 Taxi</button>
            <button class="btn">📱 Phone bill</button>
            <button class="btn">🍔 Lunch</button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: `
    .dashboard {
      display: grid;
      gap: 20px;
    }

    .hero {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    .stat-card {
      padding: 20px;
    }

    .stat-card span {
      display: block;
      color: var(--muted);
      font-weight: 800;
      margin-bottom: 10px;
    }

    .stat-card strong {
      display: block;
      font-size: 1.8rem;
      letter-spacing: -0.05em;
    }

    .stat-card small {
      display: block;
      margin-top: 8px;
      color: var(--muted);
    }

    .highlight {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
    }

    .highlight span,
    .highlight small {
      color: rgba(255, 255, 255, 0.82);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
    }

    .budget-health {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
    }

    .budget-health span {
      color: var(--muted);
      font-weight: 800;
    }

    .budget-health strong {
      display: block;
      font-size: 3rem;
      letter-spacing: -0.06em;
      margin: 8px 0;
    }

    .budget-health p {
      color: var(--muted);
      margin: 0;
    }

    .circle {
      width: 130px;
      height: 130px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      border: 12px solid color-mix(in srgb, var(--primary) 70%, var(--border));
      font-weight: 900;
      font-size: 1.4rem;
    }

    .quick-actions {
      padding: 24px;
    }

    .quick-actions h3 {
      margin-top: 0;
    }

    .quick-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    @media (max-width: 1100px) {
      .stats-grid,
      .content-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .hero,
      .budget-health {
        flex-direction: column;
        align-items: flex-start;
      }

      .stats-grid,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .hero .btn {
        width: 100%;
      }
    }
  `,
})
export class Dashboard {}