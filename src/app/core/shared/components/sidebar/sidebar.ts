import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ChartNoAxesCombined,
  Gauge,
  LucideAngularModule,
  ReceiptText,
  Repeat2,
  Settings,
  Tags,
  WalletCards,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly icons = {
    dashboard: Gauge,
    budgets: ChartNoAxesCombined,
    transactions: ReceiptText,
    categories: Tags,
    recurring: Repeat2,
    settings: Settings,
    wallet: WalletCards,
  };
}