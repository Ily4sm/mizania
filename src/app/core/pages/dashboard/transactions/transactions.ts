import { Component } from '@angular/core';

@Component({
  selector: 'app-transactions',
  standalone: true,
  template: `
    <section class="card page">
      <h2 class="page-title">Transactions</h2>
      <p class="page-subtitle">Here we will add income and expense CRUD.</p>
    </section>
  `,
  styles: `.page { padding: 24px; }`,
})
export class Transactions {}