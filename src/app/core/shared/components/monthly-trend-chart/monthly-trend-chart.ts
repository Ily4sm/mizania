import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export interface MonthlyTrendChartPoint {
  label: string;
  income: number;
  expenses: number;
}

@Component({
  selector: 'app-monthly-trend-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './monthly-trend-chart.html',
  styleUrl: './monthly-trend-chart.scss',
})
export class MonthlyTrendChart {
  @Input() data: MonthlyTrendChartPoint[] = [];
  @Input() currency = 'MAD';
  @Input() incomeLabel = 'Income';
  @Input() expensesLabel = 'Expenses';

  get hasData(): boolean {
    return this.data.some((item) => item.income > 0 || item.expenses > 0);
  }

  get totalIncome(): number {
    return this.data.reduce((sum, item) => sum + item.income, 0);
  }

  get totalExpenses(): number {
    return this.data.reduce((sum, item) => sum + item.expenses, 0);
  }

  get totalBalance(): number {
    return this.totalIncome - this.totalExpenses;
  }

  get maxValue(): number {
    return Math.max(
      ...this.data.flatMap((item) => [item.income, item.expenses]),
      1
    );
  }

  formatMoney(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} ${this.currency}`;
  }

  getHeight(value: number): string {
    if (value <= 0) return '0%';

    return `${Math.max((value / this.maxValue) * 100, 6)}%`;
  }
}