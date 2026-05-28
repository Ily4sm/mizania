import { Component, inject } from '@angular/core';
import { LanguageService, AppLanguage } from '../../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <select
      class="language-select"
      [value]="languageService.language()"
      (change)="changeLanguage($event)"
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
      <option value="ar">AR</option>
    </select>
  `,
  styles: `
    .language-select {
      height: 42px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text);
      padding: 0 12px;
      font-weight: 800;
      outline: none;
      box-shadow: var(--shadow);
    }
  `,
})
export class LanguageSwitcher {
  languageService = inject(LanguageService);

  changeLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AppLanguage;
    this.languageService.setLanguage(value);
  }
}