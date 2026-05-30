import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { AppLanguage, LanguageService } from '../../../services/language.service';

interface LanguageOption {
  value: AppLanguage;
  label: string;
  flagUrl: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  readonly languageService = inject(LanguageService);

  readonly icons = {
    chevron: ChevronDown,
  };

  readonly options: LanguageOption[] = [
    {
      value: 'fr',
      label: 'FR',
      flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1eb-1f1f7.svg',
    },
    {
      value: 'en',
      label: 'EN',
      flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg',
    },
    {
      value: 'ar',
      label: 'AR',
      flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1f2-1f1e6.svg',
    },
  ];

  isOpen = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get selectedOption(): LanguageOption {
    const currentLanguage = this.languageService.language();

    return (
      this.options.find((option) => option.value === currentLanguage) ??
      this.options[0]
    );
  }

  toggle(): void {
    this.isOpen.update((value) => !value);
  }

  changeLanguage(language: AppLanguage): void {
    this.languageService.setLanguage(language);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}