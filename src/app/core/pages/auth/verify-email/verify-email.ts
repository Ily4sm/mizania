import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section>
      <h1 class="page-title">{{ 'AUTH.VERIFY_TITLE' | translate }}</h1>
      <p class="page-subtitle">{{ 'AUTH.VERIFY_SUBTITLE' | translate }}</p>
    </section>
  `,
})
export class VerifyEmail {}