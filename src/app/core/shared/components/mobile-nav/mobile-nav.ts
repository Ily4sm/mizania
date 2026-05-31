import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ChartColumn,
  LayoutDashboard,
  LifeBuoy,
  LucideAngularModule,
  ReceiptText,
  Repeat,
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
    dashboard: LayoutDashboard,
    budgets: ChartColumn,
    transactions: ReceiptText,
    categories: Tags,
    recurring: Repeat,
    settings: Settings,
    support: LifeBuoy,
  };
}