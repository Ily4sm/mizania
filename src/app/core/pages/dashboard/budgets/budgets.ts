import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Category } from '../../../models/category.model';
import { BudgetProgress, MonthlyBudget } from '../../../models/monthly-budget.model';
import { CategoryService } from '../../../services/category.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { MonthlyBudgetService } from '../../../services/monthly-budget.service';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AppSelect, AppSelectOption } from '../../../shared/components/app-select/app-select';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, AppSelect],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly confirmService = inject(ConfirmService);

  readonly categoryService = inject(CategoryService);
  readonly budgetService = inject(MonthlyBudgetService);
  readonly transactionService = inject(TransactionService);

  editingBudgetId = signal<string | null>(null);
  selectedMonth = signal(this.budgetService.getCurrentMonth());

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

  get categoryOptions(): AppSelectOption[] {
    return [
      {
        label: this.t('BUDGETS.CHOOSE_CATEGORY'),
        value: '',
      },
      ...this.expenseCategories().map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];
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

      this.toastService.error(
        this.t('COMMON.INVALID_FORM_TITLE'),
        this.t('COMMON.INVALID_FORM_MESSAGE')
      );

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

        this.toastService.success(
          this.t('BUDGETS.UPDATED_TOAST_TITLE'),
          this.t('BUDGETS.UPDATED_TOAST_MESSAGE')
        );
      } else {
        await this.budgetService.createBudget(payload);

        this.toastService.success(
          this.t('BUDGETS.CREATED_TOAST_TITLE'),
          this.t('BUDGETS.CREATED_TOAST_MESSAGE')
        );
      }

      this.selectedMonth.set(payload.month);
      this.resetForm();
    } catch (error) {
      this.toastService.error(
        this.t('BUDGETS.SAVE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
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
    const confirmed = await this.confirmService.confirm({
      title: this.t('BUDGETS.DELETE_DIALOG_TITLE'),
      message: this.t('BUDGETS.DELETE_CONFIRM'),
      confirmText: this.t('ACTIONS.DELETE'),
      cancelText: this.t('ACTIONS.CANCEL'),
      danger: true,
    });

    if (!confirmed) return;

    try {
      await this.budgetService.deleteBudget(budget.id, this.selectedMonth());

      this.toastService.success(
        this.t('BUDGETS.DELETED_TOAST_TITLE'),
        this.t('BUDGETS.DELETED_TOAST_MESSAGE')
      );

      if (this.editingBudgetId() === budget.id) {
        this.resetForm();
      }
    } catch (error) {
      this.toastService.error(
        this.t('BUDGETS.DELETE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
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
    return category.name;
  }

  getCategoryBadge(category?: { name?: string | null } | null): string {
    const name = category?.name?.trim();

    if (!name) return 'B';

    return name.charAt(0).toUpperCase();
  }

  getStatusLabel(progress: BudgetProgress): string {
    if (progress.status === 'danger') return 'BUDGETS.STATUS_DANGER';
    if (progress.status === 'warning') return 'BUDGETS.STATUS_WARNING';

    return 'BUDGETS.STATUS_SAFE';
  }

  private t(key: string): string {
    return this.translateService.instant(key);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    return this.t('COMMON.SOMETHING_WENT_WRONG');
  }
}