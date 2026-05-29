import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  checking = signal(true);
  verified = signal(false);

  async ngOnInit(): Promise<void> {
    await this.handleVerificationRedirect();
  }

  private async handleVerificationRedirect(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const session = await this.authService.getSession();

      if (session) {
        this.verified.set(true);

        setTimeout(() => {
          this.router.navigateByUrl('/dashboard');
        }, 1000);

        return;
      }

      this.verified.set(false);
    } finally {
      this.checking.set(false);
    }
  }
}