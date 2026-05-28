import { Component } from '@angular/core';

@Component({
  selector: 'app-recurring-items',
  standalone: true,
  template: `
    <section class="card page">
      <h2 class="page-title">Fixed items</h2>
      <p class="page-subtitle">
        Here users will save phone bill, rent, Wi-Fi, subscriptions, and reuse them monthly.
      </p>
    </section>
  `,
  styles: `.page { padding: 24px; }`,
})
export class RecurringItems {}