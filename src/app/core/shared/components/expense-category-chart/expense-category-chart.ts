import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export interface ExpenseCategoryChartItem {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-expense-category-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './expense-category-chart.html',
  styleUrl: './expense-category-chart.scss',
})
export class ExpenseCategoryChart {
  @Input() data: ExpenseCategoryChartItem[] = [];
  @Input() currency = 'MAD';

  get visibleData(): ExpenseCategoryChartItem[] {
    return this.data
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }

  get hasData(): boolean {
    return this.visibleData.length > 0;
  }

  get total(): number {
    return this.visibleData.reduce((sum, item) => sum + item.amount, 0);
  }

  get topCategory(): ExpenseCategoryChartItem | null {
    return this.visibleData[0] || null;
  }

  formatMoney(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} ${this.currency}`;
  }

  getPercent(amount: number): number {
    if (this.total <= 0) return 0;

    return Math.round((amount / this.total) * 100);
  }

  getBarWidth(amount: number): string {
    return `${Math.max(this.getPercent(amount), 3)}%`;
  }
}