import { Injectable, computed, signal } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogData {
  resolver: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private readonly stateSignal = signal<ConfirmDialogState | null>(null);

  readonly state = computed(() => this.stateSignal());

  confirm(data: ConfirmDialogData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.stateSignal.set({
        ...data,
        resolver: resolve,
      });
    });
  }

  accept(): void {
    const state = this.stateSignal();

    if (!state) return;

    state.resolver(true);
    this.stateSignal.set(null);
  }

  cancel(): void {
    const state = this.stateSignal();

    if (!state) return;

    state.resolver(false);
    this.stateSignal.set(null);
  }
}