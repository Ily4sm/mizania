import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-income-expense-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './income-expense-chart.html',
  styleUrl: './income-expense-chart.scss',
})
export class IncomeExpenseChart {
  @Input() income = 0;
  @Input() expenses = 0;
  @Input() currency = 'MAD';
  @Input() incomeLabel = 'Income';
  @Input() expensesLabel = 'Expenses';

  get hasData(): boolean {
    return this.income > 0 || this.expenses > 0;
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  get maxValue(): number {
    return Math.max(this.income, this.expenses, 1);
  }

  get incomePercent(): number {
    return Math.max((this.income / this.maxValue) * 100, this.income > 0 ? 8 : 0);
  }

  get expensesPercent(): number {
    return Math.max((this.expenses / this.maxValue) * 100, this.expenses > 0 ? 8 : 0);
  }

  get expenseRatio(): number {
    if (this.income <= 0) {
      return this.expenses > 0 ? 100 : 0;
    }

    return Math.min((this.expenses / this.income) * 100, 999);
  }

  formatMoney(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} ${this.currency}`;
  }
}