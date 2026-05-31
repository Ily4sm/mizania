import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
})
export class UserAvatar {
  @Input() name: string | null | undefined = '';
  @Input() email: string | null | undefined = '';

  get initials(): string {
    const cleanName = this.name?.trim();

    if (cleanName) {
      const parts = cleanName.split(/\s+/);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }

      return cleanName.slice(0, 2).toUpperCase();
    }

    const cleanEmail = this.email?.trim();

    if (cleanEmail) {
      return cleanEmail.slice(0, 2).toUpperCase();
    }

    return 'M';
  }
}