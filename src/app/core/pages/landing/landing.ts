import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BarChart3,
  CheckCircle2,
  Globe2,
  Languages,
  LucideAngularModule,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-angular';
import { Brand } from '../../shared/components/brand/brand';
import { Footer } from '../../shared/components/footer/footer';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    LucideAngularModule,
    Brand,
    Footer,
    LanguageSwitcher,
    ThemeToggle,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  readonly icons = {
    wallet: WalletCards,
    chart: BarChart3,
    shield: ShieldCheck,
    mobile: Smartphone,
    language: Languages,
    check: CheckCircle2,
    globe: Globe2,
  };
}