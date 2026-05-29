import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';

type AlertType = 'success' | 'error';

interface PageAlert {
  type: AlertType;
  message: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly categoryService = inject(CategoryService);

  private alertTimeoutId: number | null = null;

  editingCategoryId = signal<string | null>(null);
  alert = signal<PageAlert | null>(null);

  incomeCategories = computed(() =>
    this.categoryService.categories().filter((category) => category.type === 'income')
  );

  expenseCategories = computed(() =>
    this.categoryService.categories().filter((category) => category.type === 'expense')
  );

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['expense' as CategoryType, [Validators.required]],
    icon: ['🏷️', [Validators.required]],
    color: ['#10b981', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    await this.categoryService.loadCategories();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('error', 'Please fill all required fields correctly.');
      return;
    }

    try {
      const payload = this.form.getRawValue();
      const editingId = this.editingCategoryId();

      if (editingId) {
        await this.categoryService.updateCategory(editingId, payload);
        this.showAlert('success', 'Category updated successfully.');
      } else {
        await this.categoryService.createCategory(payload);
        this.showAlert('success', 'Category created successfully.');
      }

      this.resetForm();
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    }
  }

  editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);

    this.form.patchValue({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = confirm(`Delete category "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await this.categoryService.deleteCategory(category.id);
      this.showAlert('success', 'Category deleted successfully.');

      if (this.editingCategoryId() === category.id) {
        this.resetForm();
      }
    } catch (error) {
      this.showAlert('error', this.getErrorMessage(error));
    }
  }

  resetForm(): void {
    this.editingCategoryId.set(null);

    this.form.reset({
      name: '',
      type: 'expense',
      icon: '🏷️',
      color: '#10b981',
    });
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