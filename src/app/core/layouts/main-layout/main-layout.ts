import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileNav } from '../../shared/components/mobile-nav/mobile-nav';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar, MobileNav],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}