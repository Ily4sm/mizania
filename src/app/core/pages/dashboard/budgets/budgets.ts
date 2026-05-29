import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../../models/category.model';
import { BudgetProgress, MonthlyBudget } from '../../../models/monthly-budget.model';
import { CategoryService } from '../../../services/category.service';
import { MonthlyBudgetService } from '../../../services/monthly-budget.service';
import { TransactionService } from '../../../services/transaction.service';

type AlertType = 'success' | 'error';

interface PageAlert {
  type: AlertType;
  message: string;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly categoryService = inject(CategoryService);
  readonly budgetService = inject(MonthlyBudgetService);
  readonly transactionService = inject(TransactionService);

  private alertTimeoutId: number | null = null;

  editingBudgetId = signal<string | null>(null);
  selectedMonth = signal(this.budgetService.getCurrentMonth());
  alert = signal<PageAlert | null>(null);

  expenseCategories = computed(() =>
    this.categoryService.categories().filter((category) => category.type === 'expense')
  );

  budgetProgress = computed(() =>
    this.budgetService.getBudgetProgress(this.selectedMonth())
  );

  form = this.fb.nonNullable.group({
    category_id: ['', [Validators.required]],
    month: [this.budgetService.getCurrentMonth(), [Validators.required]],
    limit_amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoryService.loadCategories(),
      this.transactionService.loadTransactions(),
      this.budgetService.loadBudgets(this.selectedMonth()),
    ]);
  }

  async onMonthChange(event: Event): Promise<void> {
    const month = (event.target as HTMLInputElement).value;
    this.selectedMonth.set(month);
    this.form.patchValue({ month });
    await this.budgetService.loadBudgets(month);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    try {
      const value = this.form.getRawValue();
      const editingId = this.editingBudgetId();

      const payload = {
        category_id: value.category_id,
        month: value.month,
        limit_amount: Number(value.limit_amount),
      };

      if (editingId) {
        await this.budgetService.updateBudget(editingId, payload);
        this.showAlert('success', 'Budget updated successfully.');
      } else {
        await this.budgetService.createBudget(payload);
        this.showAlert('success', 'Budget created successfully.');
      }

      this.selectedMonth.set(payload.month);
      this.resetForm();
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    }
  }

  editBudget(budget: MonthlyBudget): void {
    this.editingBudgetId.set(budget.id);

    this.form.patchValue({
      category_id: budget.category_id,
      month: budget.month,
      limit_amount: Number(budget.limit_amount),
    });
  }

  async deleteBudget(budget: MonthlyBudget): Promise<void> {
    const confirmed = confirm('Delete this budget?');

    if (!confirmed) {
      return;
    }

    try {
      await this.budgetService.deleteBudget(budget.id, this.selectedMonth());
      this.showAlert('success', 'Budget deleted successfully.');

      if (this.editingBudgetId() === budget.id) {
        this.resetForm();
      }
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    }
  }

  resetForm(): void {
    this.editingBudgetId.set(null);

    this.form.reset({
      category_id: '',
      month: this.selectedMonth(),
      limit_amount: 0,
    });
  }

  formatMoney(value: number): string {
    return `${Math.round(Number(value)).toLocaleString('fr-FR')} DH`;
  }

  getCategoryName(category: Category): string {
    return `${category.icon} ${category.name}`;
  }

  getStatusLabel(progress: BudgetProgress): string {
    if (progress.status === 'danger') {
      return 'BUDGETS.STATUS_DANGER';
    }

    if (progress.status === 'warning') {
      return 'BUDGETS.STATUS_WARNING';
    }

    return 'BUDGETS.STATUS_SAFE';
  }

  private showAlert(type: AlertType, message: string): void {
    if (this.alertTimeoutId) {
      window.clearTimeout(this.alertTimeoutId);
    }

    this.alert.set({ type, message });

    this.alertTimeoutId = window.setTimeout(() => {
      this.alert.set(null);
      this.alertTimeoutId = null;
    }, 3500);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong.';
  }
}