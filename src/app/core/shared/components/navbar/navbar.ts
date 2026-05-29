import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslatePipe, ThemeToggle, LanguageSwitcher],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/auth/login');
  }
}