import { Injectable, computed, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = computed(() => this.toastsSignal());

  success(title: string, message?: string, duration = 3500): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 4500): void {
    this.show('error', title, message, duration);
  }

  info(title: string, message?: string, duration = 3500): void {
    this.show('info', title, message, duration);
  }

  warning(title: string, message?: string, duration = 4000): void {
    this.show('warning', title, message, duration);
  }

  remove(id: number): void {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }

  private show(
    type: ToastType,
    title: string,
    message?: string,
    duration = 3500
  ): void {
    const id = this.nextId++;

    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
    };

    this.toastsSignal.update((toasts) => [toast, ...toasts].slice(0, 4));

    window.setTimeout(() => {
      this.remove(id);
    }, duration);
  }
}