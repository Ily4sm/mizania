import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../services/category.service';
import { RecurringItemService } from '../../../services/recurring-item.service';
import { RecurringItem } from '../../../models/recurring-item.model';
import { TransactionType } from '../../../models/transaction.model';

type AlertType = 'success' | 'error';

interface PageAlert {
  type: AlertType;
  message: string;
}

@Component({
  selector: 'app-recurring-items',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './recurring-items.html',
  styleUrl: './recurring-items.scss',
})
export class RecurringItems implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly categoryService = inject(CategoryService);
  readonly recurringItemService = inject(RecurringItemService);

  private alertTimeoutId: number | null = null;

  editingItemId = signal<string | null>(null);
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
    icon: ['🔁', [Validators.required]],
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
      this.showAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    try {
      const formValue = this.form.getRawValue();

      const editingId = this.editingItemId();

      if (editingId) {
        await this.recurringItemService.updateRecurringItem(editingId, {
          type: formValue.type,
          title: formValue.title,
          amount: Number(formValue.amount),
          category_id: formValue.category_id || null,
          icon: formValue.icon,
          note: formValue.note.trim() || null,
          is_active: formValue.is_active,
        });

        this.showAlert('success', 'Fixed item updated successfully.');
      } else {
        await this.recurringItemService.createRecurringItem({
          type: formValue.type,
          title: formValue.title,
          amount: Number(formValue.amount),
          category_id: formValue.category_id || null,
          icon: formValue.icon,
          note: formValue.note.trim() || null,
        });

        this.showAlert('success', 'Fixed item created successfully.');
      }

      this.resetForm();
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
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
      icon: item.icon,
      note: item.note ?? '',
      is_active: item.is_active,
    });
  }

  async deleteItem(item: RecurringItem): Promise<void> {
    const confirmed = confirm(`Delete fixed item "${item.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await this.recurringItemService.deleteRecurringItem(item.id);
      this.showAlert('success', 'Fixed item deleted successfully.');

      if (this.editingItemId() === item.id) {
        this.resetForm();
      }
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    }
  }

  async addAsTransaction(item: RecurringItem): Promise<void> {
    try {
      await this.recurringItemService.addAsTransaction(item);
      this.showAlert('success', 'Added as transaction successfully.');
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
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
      icon: '🔁',
      note: '',
      is_active: true,
    });
  }

  getCategoryLabel(item: RecurringItem): string {
    if (!item.categories) {
      return 'No category';
    }

    return `${item.categories.icon} ${item.categories.name}`;
  }

  formatMoney(value: number): string {
    return `${Math.round(Number(value)).toLocaleString('fr-FR')} DH`;
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