import { Component } from '@angular/core';

@Component({
  selector: 'app-categories',
  standalone: true,
  template: `
    <section class="card page">
      <h2 class="page-title">Categories</h2>
      <p class="page-subtitle">Here we will manage user categories.</p>
    </section>
  `,
  styles: `.page { padding: 24px; }`,
})
export class Categories {}