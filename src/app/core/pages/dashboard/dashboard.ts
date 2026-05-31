import { Component, OnInit, computed, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  HeartPulse,
  LucideAngularModule,
  PiggyBank,
  Wallet,
} from 'lucide-angular';
import { Transaction } from '../../models/transaction.model';
import { ProfileService } from '../../services/profile.service';
import { TransactionService } from '../../services/transaction.service';
import {
  ExpenseCategoryChart,
  ExpenseCategoryChartItem,
} from '../../shared/components/expense-category-chart/expense-category-chart';
import { IncomeExpenseChart } from '../../shared/components/income-expense-chart/income-expense-chart';
import {
  MonthlyTrendChart,
  MonthlyTrendChartPoint,
} from '../../shared/components/monthly-trend-chart/monthly-trend-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TranslatePipe,
    LucideAngularModule,
    ExpenseCategoryChart,
    IncomeExpenseChart,
    MonthlyTrendChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly profileService = inject(ProfileService);
  readonly transactionService = inject(TransactionService);

  readonly icons = {
    income: ArrowUpRight,
    expenses: ArrowDownRight,
    remaining: Wallet,
    safeDaily: CalendarDays,
    health: HeartPulse,
    empty: PiggyBank,
  };

  expenseCategoryChartData: ExpenseCategoryChartItem[] = [];
  monthlyTrendChartData: MonthlyTrendChartPoint[] = [];

  readonly languageService = inject(LanguageService);

  readonly currentMonthTransactions = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return this.transactionService.transactions().filter((transaction) => {
      const date = new Date(transaction.transaction_date);

      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      );
    });
  });

  readonly recentTransactions = computed(() =>
    this.transactionService.transactions().slice(0, 5)
  );

  readonly totalIncome = computed(() =>
    this.currentMonthTransactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + Number(transaction.amount), 0)
  );

  readonly totalExpenses = computed(() =>
    this.currentMonthTransactions()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + Number(transaction.amount), 0)
  );

  readonly remaining = computed(() => this.totalIncome() - this.totalExpenses());

  readonly daysInCurrentMonth = computed(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  });

  readonly currentDateLabel = computed(() =>
    new Intl.DateTimeFormat(this.getDateLocale(), {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  );

  private getDateLocale(): string {
    const language = this.languageService.language();

    if (language === 'ar') {
      return 'ar-MA';
    }

    if (language === 'en') {
      return 'en-US';
    }

    return 'fr-FR';
  }

  readonly safeDailySpending = computed(() => {
    const income = this.totalIncome();

    if (income <= 0) {
      return 0;
    }

    return income / this.daysInCurrentMonth();
  });

  readonly budgetHealthScore = computed(() => {
    const income = this.totalIncome();
    const expenses = this.totalExpenses();

    if (income <= 0 && expenses <= 0) {
      return 0;
    }

    if (income <= 0 && expenses > 0) {
      return 10;
    }

    const expenseRatio = expenses / income;
    const score = Math.round(100 - expenseRatio * 100);

    return Math.min(Math.max(score, 0), 100);
  });

  readonly budgetHealthLabel = computed(() => {
    const score = this.budgetHealthScore();

    if (score >= 70) {
      return 'DASHBOARD.HEALTH_GOOD';
    }

    if (score >= 35) {
      return 'DASHBOARD.HEALTH_WARNING';
    }

    return 'DASHBOARD.HEALTH_DANGER';
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.profileService.loadMyProfile(),
      this.transactionService.loadTransactions(),
    ]);

    this.buildDashboardCharts();
  }

  get firstName(): string {
    const fullName = this.profileService.profile()?.full_name;

    if (!fullName) {
      return 'Mizania';
    }

    return fullName.trim().split(' ')[0];
  }

  get currency(): string {
    return this.profileService.profile()?.currency || 'MAD';
  }

  formatMoney(value: number): string {
    return `${Math.round(value).toLocaleString('fr-FR')} ${this.currency}`;
  }

  getTransactionAmount(transaction: Transaction): string {
    const sign = transaction.type === 'income' ? '+' : '-';

    return `${sign} ${this.formatMoney(Number(transaction.amount))}`;
  }

  getTransactionLabel(transaction: Transaction): string {
    return transaction.title;
  }

  getTransactionSubtitle(transaction: Transaction): string {
    if (transaction.categories) {
      return transaction.categories.name;
    }

    return 'No category';
  }

  private buildDashboardCharts(): void {
    this.buildExpenseCategoryChartData();
    this.buildMonthlyTrendChartData();
  }

  private buildExpenseCategoryChartData(): void {
    const expenseTotals = new Map<string, number>();

    for (const transaction of this.currentMonthTransactions()) {
      if (transaction.type !== 'expense') continue;

      const label = transaction.categories
        ? transaction.categories.name
        : 'No category';

      const currentAmount = expenseTotals.get(label) || 0;

      expenseTotals.set(label, currentAmount + Number(transaction.amount));
    }

    this.expenseCategoryChartData = Array.from(expenseTotals.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private buildMonthlyTrendChartData(): void {
    const monthPoints = this.getLastSixMonths();

    for (const transaction of this.transactionService.transactions()) {
      const transactionDate = new Date(transaction.transaction_date);
      const key = this.getMonthKey(transactionDate);
      const point = monthPoints.find((item) => item.key === key);

      if (!point) continue;

      const amount = Number(transaction.amount);

      if (transaction.type === 'income') {
        point.income += amount;
      } else {
        point.expenses += amount;
      }
    }

    this.monthlyTrendChartData = monthPoints.map((item) => ({
      label: item.label,
      income: item.income,
      expenses: item.expenses,
    }));
  }

  private getLastSixMonths(): Array<{
    key: string;
    label: string;
    income: number;
    expenses: number;
  }> {
    const result: Array<{
      key: string;
      label: string;
      income: number;
      expenses: number;
    }> = [];

    const now = new Date();

    for (let index = 5; index >= 0; index--) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

      result.push({
        key: this.getMonthKey(date),
        label: this.getMonthLabel(date),
        income: 0,
        expenses: 0,
      });
    }

    return result;
  }

  private getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  private getMonthLabel(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      month: 'short',
    });
  }
}