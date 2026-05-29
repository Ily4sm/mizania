import { Component, OnInit, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileService } from '../../services/profile.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly profileService = inject(ProfileService);
  readonly transactionService = inject(TransactionService);

  readonly currentMonthTransactions = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return this.transactionService.transactions().filter((transaction) => {
      const date = new Date(transaction.transaction_date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
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

  readonly daysLeft = computed(() => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(lastDayOfMonth.getDate() - now.getDate() + 1, 1);
  });

  readonly safeDailySpending = computed(() => {
    const remaining = this.remaining();

    if (remaining <= 0) {
      return 0;
    }

    return remaining / this.daysLeft();
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
  }

  get firstName(): string {
    const fullName = this.profileService.profile()?.full_name;

    if (!fullName) {
      return 'Mizania';
    }

    return fullName.trim().split(' ')[0];
  }

  formatMoney(value: number): string {
    return `${Math.round(value).toLocaleString('fr-FR')} DH`;
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
      return `${transaction.categories.icon} ${transaction.categories.name}`;
    }

    return 'No category';
  }
}