import { Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly profileService = inject(ProfileService);

  async ngOnInit(): Promise<void> {
    await this.profileService.loadMyProfile();
  }

  get firstName(): string {
    const fullName = this.profileService.profile()?.full_name;

    if (!fullName) {
      return 'Mizania';
    }

    return fullName.trim().split(' ')[0];
  }
}