import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  readonly toastService = inject(ToastService);

  getIcon(type: Toast['type']): string {
    if (type === 'success') return '✓';
    if (type === 'error') return '!';
    if (type === 'warning') return '!';
    return 'i';
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }
}