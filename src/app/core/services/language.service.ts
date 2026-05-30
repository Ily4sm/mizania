import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'fr' | 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'mizania-language';
  private readonly isBrowser: boolean;

  readonly language = signal<AppLanguage>('fr');

  constructor(
    private readonly translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.translate.addLangs(['fr', 'en', 'ar']);
    this.translate.setFallbackLang('fr');

    const initialLanguage = this.getInitialLanguage();
    this.setLanguage(initialLanguage);
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);

    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }

    this.translate.use(language).subscribe({
      error: (error) => {
        console.error(`Failed to load language file: ${language}`, error);

        if (language !== 'fr') {
          this.language.set('fr');

          if (this.isBrowser) {
            localStorage.setItem(this.storageKey, 'fr');
            document.documentElement.lang = 'fr';
            document.documentElement.dir = 'ltr';
          }

          this.translate.use('fr').subscribe();
        }
      },
    });
  }

  private getInitialLanguage(): AppLanguage {
    if (!this.isBrowser) {
      return 'fr';
    }

    const saved = localStorage.getItem(this.storageKey) as AppLanguage | null;

    if (saved === 'fr' || saved === 'en' || saved === 'ar') {
      return saved;
    }

    return 'fr';
  }
}