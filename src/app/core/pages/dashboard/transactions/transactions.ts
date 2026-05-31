import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Plus, Pencil, Search, Trash2, LucideAngularModule } from 'lucide-angular';
import { Category } from '../../../models/category.model';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { CategoryService } from '../../../services/category.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TransactionService } from '../../../services/transaction.service';
import { AppSelect, AppSelectOption } from '../../../shared/components/app-select/app-select';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';

type TransactionFilter = 'all' | TransactionType;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    AppSelect,
    LucideAngularModule,
    SkeletonLoader,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly confirmService = inject(ConfirmService);

  readonly transactionService = inject(TransactionService);
  readonly categoryService = inject(CategoryService);

  readonly icons = {
    search: Search,
    edit: Pencil,
    delete: Trash2,
    add: Plus,
  };

  editingTransactionId = signal<string | null>(null);
  selectedType = signal<TransactionType>('expense');

  searchTerm = signal('');
  listFilter = signal<TransactionFilter>('all');

  filteredCategories = computed(() =>
    this.categoryService
      .categories()
      .filter((category) => category.type === this.selectedType())
  );

  visibleTransactions = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.listFilter();

    return this.transactionService.transactions().filter((transaction) => {
      const matchesFilter = filter === 'all' || transaction.type === filter;

      const categoryName = transaction.categories?.name ?? '';
      const searchableText = `${transaction.title} ${transaction.note ?? ''} ${categoryName}`.toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      return matchesFilter && matchesSearch;
    });
  });

  form = this.fb.nonNullable.group({
    type: ['expense' as TransactionType, [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category_id: [''],
    transaction_date: [this.getTodayDate(), [Validators.required]],
    note: [''],
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoryService.loadCategories(),
      this.transactionService.loadTransactions(),
    ]);
  }

  get typeOptions(): AppSelectOption[] {
    return [
      { label: this.t('TRANSACTIONS.EXPENSE'), value: 'expense' },
      { label: this.t('TRANSACTIONS.INCOME'), value: 'income' },
    ];
  }

  get filterOptions(): AppSelectOption[] {
    return [
      { label: this.t('TRANSACTIONS.FILTER_ALL'), value: 'all' },
      { label: this.t('TRANSACTIONS.EXPENSE'), value: 'expense' },
      { label: this.t('TRANSACTIONS.INCOME'), value: 'income' },
    ];
  }

  get categoryOptions(): AppSelectOption[] {
    return [
      { label: this.t('TRANSACTIONS.NO_CATEGORY'), value: '' },
      ...this.filteredCategories().map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];
  }

  onTypeChange(value: string): void {
    const type = value as TransactionType;
    this.selectedType.set(type);
    this.form.patchValue({ category_id: '' });
  }

  onFilterChange(value: string): void {
    this.listFilter.set(value as TransactionFilter);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
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
      const formValue = this.form.getRawValue();

      const payload = {
        type: formValue.type,
        title: formValue.title.trim(),
        amount: Number(formValue.amount),
        category_id: formValue.category_id || null,
        transaction_date: formValue.transaction_date,
        note: formValue.note.trim() || null,
      };

      const editingId = this.editingTransactionId();

      if (editingId) {
        await this.transactionService.updateTransaction(editingId, payload);

        this.toastService.success(
          this.t('TRANSACTIONS.UPDATED_TOAST_TITLE'),
          this.t('TRANSACTIONS.UPDATED_TOAST_MESSAGE')
        );
      } else {
        await this.transactionService.createTransaction(payload);

        this.toastService.success(
          this.t('TRANSACTIONS.CREATED_TOAST_TITLE'),
          this.t('TRANSACTIONS.CREATED_TOAST_MESSAGE')
        );
      }

      this.resetForm();
    } catch (error) {
      this.toastService.error(
        this.t('TRANSACTIONS.SAVE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  editTransaction(transaction: Transaction): void {
    this.editingTransactionId.set(transaction.id);
    this.selectedType.set(transaction.type);

    this.form.patchValue({
      type: transaction.type,
      title: transaction.title,
      amount: Number(transaction.amount),
      category_id: transaction.category_id ?? '',
      transaction_date: transaction.transaction_date,
      note: transaction.note ?? '',
    });
  }

  async deleteTransaction(transaction: Transaction): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: this.t('TRANSACTIONS.DELETE_DIALOG_TITLE'),
      message: this.t('TRANSACTIONS.DELETE_CONFIRM_DETAIL'),
      confirmText: this.t('ACTIONS.DELETE'),
      cancelText: this.t('ACTIONS.CANCEL'),
      danger: true,
    });

    if (!confirmed) return;

    try {
      await this.transactionService.deleteTransaction(transaction.id);

      this.toastService.success(
        this.t('TRANSACTIONS.DELETED_TOAST_TITLE'),
        this.t('TRANSACTIONS.DELETED_TOAST_MESSAGE')
      );

      if (this.editingTransactionId() === transaction.id) {
        this.resetForm();
      }
    } catch (error) {
      this.toastService.error(
        this.t('TRANSACTIONS.DELETE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  resetForm(): void {
    this.editingTransactionId.set(null);
    this.selectedType.set('expense');

    this.form.reset({
      type: 'expense',
      title: '',
      amount: 0,
      category_id: '',
      transaction_date: this.getTodayDate(),
      note: '',
    });
  }

  getCategoryLabel(transaction: Transaction): string {
    if (!transaction.categories) return this.t('TRANSACTIONS.NO_CATEGORY');

    return transaction.categories.name;
  }

  getTransactionBadge(transaction: Transaction): string {
    if (transaction.categories?.name) {
      return transaction.categories.name.charAt(0).toUpperCase();
    }

    return transaction.type === 'income' ? '+' : '-';
  }

  getCategoryBadge(category: Category): string {
    return category.name.trim().charAt(0).toUpperCase();
  }

  formatMoney(value: number): string {
    return `${Math.round(Number(value)).toLocaleString('fr-FR')} DH`;
  }

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private t(key: string): string {
    return this.translateService.instant(key);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    return this.t('COMMON.SOMETHING_WENT_WRONG');
  }
}