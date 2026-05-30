import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly confirmService = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel();
  }

  accept(): void {
    this.confirmService.accept();
  }

  cancel(): void {
    this.confirmService.cancel();
  }
}