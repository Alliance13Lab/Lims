import { Routes } from '@angular/router';

import { loginGuard } from './auth/login-guard';
import { AuthenticationGuard } from './auth';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then((m) => m.Login),
    pathMatch: 'full',
    canActivate: [loginGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then((m) => m.ForgotPassword)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./main/dashboard/dashboard').then(m => m.Dashboard), canActivate: [AuthenticationGuard] },
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
