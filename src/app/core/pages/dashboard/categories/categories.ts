import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly confirmService = inject(ConfirmService);

  readonly categoryService = inject(CategoryService);

  editingCategoryId = signal<string | null>(null);

  incomeCategories = computed(() =>
    this.categoryService.categories().filter((category) => category.type === 'income')
  );

  expenseCategories = computed(() =>
    this.categoryService.categories().filter((category) => category.type === 'expense')
  );

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['expense' as CategoryType, [Validators.required]],
    icon: ['tag', [Validators.required]],
    color: ['#10b981', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    await this.categoryService.loadCategories();
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
      const payload = this.form.getRawValue();
      const editingId = this.editingCategoryId();

      if (editingId) {
        await this.categoryService.updateCategory(editingId, payload);

        this.toastService.success(
          this.t('CATEGORIES.UPDATED_TOAST_TITLE'),
          this.t('CATEGORIES.UPDATED_TOAST_MESSAGE')
        );
      } else {
        await this.categoryService.createCategory(payload);

        this.toastService.success(
          this.t('CATEGORIES.CREATED_TOAST_TITLE'),
          this.t('CATEGORIES.CREATED_TOAST_MESSAGE')
        );
      }

      this.resetForm();
    } catch (error) {
      this.toastService.error(
        this.t('CATEGORIES.SAVE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);

    this.form.patchValue({
      name: category.name,
      type: category.type,
      icon: category.icon || 'tag',
      color: category.color,
    });
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: this.t('CATEGORIES.DELETE_DIALOG_TITLE'),
      message: `${this.t('CATEGORIES.DELETE_CONFIRM')} "${category.name}"?`,
      confirmText: this.t('ACTIONS.DELETE'),
      cancelText: this.t('ACTIONS.CANCEL'),
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.categoryService.deleteCategory(category.id);

      this.toastService.success(
        this.t('CATEGORIES.DELETED_TOAST_TITLE'),
        this.t('CATEGORIES.DELETED_TOAST_MESSAGE')
      );

      if (this.editingCategoryId() === category.id) {
        this.resetForm();
      }
    } catch (error) {
      this.toastService.error(
        this.t('CATEGORIES.DELETE_FAILED_TOAST_TITLE'),
        this.getErrorMessage(error)
      );
    }
  }

  resetForm(): void {
    this.editingCategoryId.set(null);

    this.form.reset({
      name: '',
      type: 'expense',
      icon: 'tag',
      color: '#10b981',
    });
  }

  getCategoryBadge(category: Category): string {
    const cleanName = category.name.trim();

    if (!cleanName) {
      return category.type === 'income' ? '+' : '-';
    }

    return cleanName.charAt(0).toUpperCase();
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