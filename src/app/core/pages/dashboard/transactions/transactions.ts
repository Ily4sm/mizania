import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../../models/category.model';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { CategoryService } from '../../../services/category.service';
import { TransactionService } from '../../../services/transaction.service';

type AlertType = 'success' | 'error';

interface PageAlert {
  type: AlertType;
  message: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly transactionService = inject(TransactionService);
  readonly categoryService = inject(CategoryService);

  private alertTimeoutId: number | null = null;

  editingTransactionId = signal<string | null>(null);
  alert = signal<PageAlert | null>(null);
  selectedType = signal<TransactionType>('expense');

  filteredCategories = computed(() =>
    this.categoryService
      .categories()
      .filter((category) => category.type === this.selectedType())
  );

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

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value as TransactionType;
    this.selectedType.set(type);
    this.form.patchValue({ category_id: '' });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('error', 'Please fill all required fields correctly.');
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
        this.showAlert('success', 'Transaction updated successfully.');
      } else {
        await this.transactionService.createTransaction(payload);
        this.showAlert('success', 'Transaction created successfully.');
      }

      this.resetForm();
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
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
    const confirmed = confirm(`Delete this transaction?`);

    if (!confirmed) {
      return;
    }

    try {
      await this.transactionService.deleteTransaction(transaction.id);
      this.showAlert('success', 'Transaction deleted successfully.');

      if (this.editingTransactionId() === transaction.id) {
        this.resetForm();
      }
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
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
    if (!transaction.categories) {
      return 'No category';
    }

    return `${transaction.categories.icon} ${transaction.categories.name}`;
  }

  trackByCategory(_index: number, category: Category): string {
    return category.id;
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

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong.';
  }
}