import { Component, inject } from '@angular/core';
import { Moon, Sun, LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);

  readonly icons = {
    sun: Sun,
    moon: Moon,
  };

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.setTheme(this.isDark ? 'light' : 'dark');
  }
}