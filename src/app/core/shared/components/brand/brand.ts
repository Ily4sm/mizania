import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
})
export class Brand {
  @Input() variant: 'sidebar' | 'navbar' | 'auth' = 'sidebar';
  @Input() showTagline = true;
}