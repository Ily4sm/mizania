import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LogOut, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Brand } from '../brand/brand';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { UserAvatar } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    TranslatePipe,
    ThemeToggle,
    LanguageSwitcher,
    Brand,
    UserAvatar,
    LucideAngularModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly profileService = inject(ProfileService);

  readonly icons = {
    logout: LogOut,
  };

  async ngOnInit(): Promise<void> {
    await this.profileService.loadMyProfile();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/auth/login');
  }
}