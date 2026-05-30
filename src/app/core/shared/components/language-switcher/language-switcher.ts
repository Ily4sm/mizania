import { Component, inject } from '@angular/core';
import { AppLanguage, LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  readonly languageService = inject(LanguageService);

  changeLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AppLanguage;
    this.languageService.setLanguage(value);
  }
}