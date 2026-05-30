import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';

export interface AppSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './app-select.html',
  styleUrl: './app-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelect),
      multi: true,
    },
  ],
})
export class AppSelect implements ControlValueAccessor {
  @Input() options: AppSelectOption[] = [];
  @Input() placeholder = 'Select';

  @Output() selectionChange = new EventEmitter<string>();

  readonly icons = {
    chevron: ChevronDown,
  };

  isOpen = signal(false);
  disabled = signal(false);
  value = signal<string>('');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.options.find((option) => option.value === this.value());
    return selected?.label || this.placeholder;
  }

  toggle(): void {
    if (this.disabled()) return;

    this.isOpen.update((value) => !value);
    this.onTouched();
  }

  selectOption(option: AppSelectOption): void {
    if (this.disabled()) return;

    this.value.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.onTouched();
    this.isOpen.set(false);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }
}