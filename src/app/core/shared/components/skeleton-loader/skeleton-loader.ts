import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss',
})
export class SkeletonLoader {
  @Input() count = 3;
  @Input() type: 'list' | 'stats' | 'chart' = 'list';

  get items(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }
}