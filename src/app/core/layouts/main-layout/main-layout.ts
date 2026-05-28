import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Navbar } from '../../shared/components/navbar/navbar';
import { MobileNav } from '../../shared/components/mobile-nav/mobile-nav';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar, MobileNav],
  template: `
    <div class="app-shell">
      <app-sidebar />

      <main class="main-content">
        <app-navbar />
        <router-outlet />
      </main>

      <app-mobile-nav />
    </div>
  `,
  styles: `
    .app-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      padding: 20px;
    }

    .main-content {
      min-width: 0;
    }

    @media (max-width: 900px) {
      .app-shell {
        grid-template-columns: 1fr;
        padding: 16px 16px 90px;
      }
    }
  `,
})
export class MainLayout {}