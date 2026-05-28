import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <section class="card page">
      <h2 class="page-title">Settings</h2>
      <p class="page-subtitle">Theme, language, currency, account deletion, and profile settings.</p>
    </section>
  `,
  styles: `.page { padding: 24px; }`,
})
export class Settings {}