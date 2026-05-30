import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecurringItem } from '../../../models/recurring-item.model';
import { TransactionType } from '../../../models/transaction.model';
import { CategoryService } from '../../../services/category.service';
import { RecurringItemService } from '../../../services/recurring-item.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-recurring-items',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './recurring-items.html',
  styleUrl: './recurring-items.scss',
})
export class RecurringItems implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly confirmService = inject(ConfirmService);

  readonly categoryService = inject(CategoryService);
  readonly recurringItemService = inject(RecurringItemService);

  editingItemId = signal<string | null>(null);
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
    icon: ['repeat', [Validators.required]],
    note: [''],
    is_active: [true],
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoryService.loadCategories(),
      this.recurringItemService.loadRecurringItems(),
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

      this.toastService.error(
        this.t('COMMON.INVALID_FORM_TITLE'),
        this.t('COMMON.INVALID_FORM_MESSAGE')
      );

      return;
    }

    try {
      const formValue = this.form.getRawValue();
      const editingId = this.editingItemId();

      const payload = {
        type: formValue.type,
        title: formValue.title.trim(),
        amount: Number(formValue.amount),
        category_id: formValue.category_id || null,
        icon: formValue.icon.trim() || 'repeat',
        note: formValue.note.trim() || null,
      };

      if (editingId) {
        await this.recurringItemService.updateRecurringItem(editingId, {
          ...payload,
          is_active: formValue.is_active,
        });

        this.toastService.success(
          this.t('RECURRING.UPDATED_TOAST_TITLE'),
          this.t('RECURRING.UPDATED_TOAST_MESSAGE')
        );
      } else {
        await this.recurringItemService.createRecurringItem(payload);

        this.toastService.success(
          this.t('RECURRING.CREATED_TOAST_TITLE'),
          this.t('RECURRING.CREATED_TOAST_MESSAGE')
        );
      }

      this.resetForm();
    } catch (error) {
      this.toastService.error(
        this.t('RECURRING.SAVE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  editItem(item: RecurringItem): void {
    this.editingItemId.set(item.id);
    this.selectedType.set(item.type);

    this.form.patchValue({
      type: item.type,
      title: item.title,
      amount: Number(item.amount),
      category_id: item.category_id ?? '',
      icon: item.icon || 'repeat',
      note: item.note ?? '',
      is_active: item.is_active,
    });
  }

  async deleteItem(item: RecurringItem): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: this.t('RECURRING.DELETE_DIALOG_TITLE'),
      message: `${this.t('RECURRING.DELETE_CONFIRM')} "${item.title}"?`,
      confirmText: this.t('ACTIONS.DELETE'),
      cancelText: this.t('ACTIONS.CANCEL'),
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.recurringItemService.deleteRecurringItem(item.id);

      this.toastService.success(
        this.t('RECURRING.DELETED_TOAST_TITLE'),
        this.t('RECURRING.DELETED_TOAST_MESSAGE')
      );

      if (this.editingItemId() === item.id) {
        this.resetForm();
      }
    } catch (error) {
      this.toastService.error(
        this.t('RECURRING.DELETE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  async addAsTransaction(item: RecurringItem): Promise<void> {
    try {
      await this.recurringItemService.addAsTransaction(item);

      this.toastService.success(
        this.t('RECURRING.ADDED_TRANSACTION_TOAST_TITLE'),
        this.t('RECURRING.ADDED_TRANSACTION_TOAST_MESSAGE')
      );
    } catch (error) {
      this.toastService.error(
        this.t('RECURRING.ADD_TRANSACTION_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  resetForm(): void {
    this.editingItemId.set(null);
    this.selectedType.set('expense');

    this.form.reset({
      type: 'expense',
      title: '',
      amount: 0,
      category_id: '',
      icon: 'repeat',
      note: '',
      is_active: true,
    });
  }

  getCategoryLabel(item: RecurringItem): string {
    if (!item.categories) {
      return this.t('RECURRING.NO_CATEGORY');
    }

    return item.categories.name;
  }

  getItemBadge(item: RecurringItem): string {
    const title = item.title.trim();

    if (!title) {
      return item.type === 'income' ? '+' : '-';
    }

    return title.charAt(0).toUpperCase();
  }

  formatMoney(value: number): string {
    return `${Math.round(Number(value)).toLocaleString('fr-FR')} DH`;
  }

  private t(key: string): string {
    return this.translateService.instant(key);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return this.t('COMMON.SOMETHING_WENT_WRONG');
  }
}