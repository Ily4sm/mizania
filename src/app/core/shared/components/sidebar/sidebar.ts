import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LayoutDashboard,
  ChartColumn,
  ReceiptText,
  Tags,
  Repeat,
  Settings,
  LucideAngularModule,
} from 'lucide-angular';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LucideAngularModule, Brand],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly icons = {
    dashboard: LayoutDashboard,
    budgets: ChartColumn,
    transactions: ReceiptText,
    categories: Tags,
    recurring: Repeat,
    settings: Settings,
  };
}