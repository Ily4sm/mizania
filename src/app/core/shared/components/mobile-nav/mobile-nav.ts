import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ChartNoAxesCombined,
  Gauge,
  LucideAngularModule,
  ReceiptText,
  Repeat2,
  Settings,
  Tags,
} from 'lucide-angular';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss',
})
export class MobileNav {
  readonly icons = {
    dashboard: Gauge,
    budgets: ChartNoAxesCombined,
    transactions: ReceiptText,
    categories: Tags,
    recurring: Repeat2,
    settings: Settings,
  };
}