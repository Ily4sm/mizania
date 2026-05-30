import { Routes } from '@angular/router';
import { authChildGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/layouts/auth-layout/auth-layout').then(
        (m) => m.AuthLayout
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./core/pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./core/pages/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./core/pages/auth/verify-email/verify-email').then(
            (m) => m.VerifyEmail
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./core/pages/auth/forgot-password/forgot-password').then(
            (m) => m.ForgotPassword
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./core/pages/auth/reset-password/reset-password').then(
            (m) => m.ResetPassword
          ),
      },
    ],
  },
  {
    path: '',
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./core/layouts/main-layout/main-layout').then(
        (m) => m.MainLayout
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./core/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./core/pages/dashboard/budgets/budgets').then(
            (m) => m.Budgets
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./core/pages/dashboard/transactions/transactions').then(
            (m) => m.Transactions),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./core/pages/dashboard/categories/categories').then(
            (m) => m.Categories
          ),
      },
      {
        path: 'recurring-items',
        loadComponent: () =>
          import('./core/pages/dashboard/recurring-items/recurring-items').then(
            (m) => m.RecurringItems
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./core/pages/dashboard/settings/settings').then(
            (m) => m.Settings
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];