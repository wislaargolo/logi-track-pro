import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

const dashboardContext = {
  feature: { label: 'Dashboard', link: '/dashboard' },
};
const maintenanceContext = {
  feature: { label: 'Manutenções', link: '/manutencoes' },
};

export const routes: Routes = [
  {
    path: 'login',
    data: { public: true },
    title: 'Entrar | LogiTrack Pro',
    loadComponent: () =>
      import('./features/auth/pages/login-page').then((module) => module.LoginPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: dashboardContext,
    title: 'Dashboard | LogiTrack Pro',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page').then((module) => module.DashboardPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'manutencoes',
    canActivate: [authGuard],
    data: maintenanceContext,
    title: 'Manutenções | LogiTrack Pro',
    loadComponent: () =>
      import('./features/maintenance/pages/maintenance-list-page').then(
        (module) => module.MaintenanceListPage,
      ),
  },
  {
    path: 'manutencoes/nova',
    canActivate: [authGuard],
    data: { ...maintenanceContext, section: 'Nova manutenção' },
    title: 'Nova manutenção | LogiTrack Pro',
    loadComponent: () =>
      import('./features/maintenance/pages/maintenance-form-page').then(
        (module) => module.MaintenanceFormPage,
      ),
  },
  {
    path: 'manutencoes/:id/editar',
    canActivate: [authGuard],
    data: { ...maintenanceContext, section: 'Editar manutenção' },
    title: 'Editar manutenção | LogiTrack Pro',
    loadComponent: () =>
      import('./features/maintenance/pages/maintenance-form-page').then(
        (module) => module.MaintenanceFormPage,
      ),
  },
  {
    path: 'manutencoes/:id',
    canActivate: [authGuard],
    data: { ...maintenanceContext, section: 'Detalhes da manutenção' },
    title: 'Detalhes da manutenção | LogiTrack Pro',
    loadComponent: () =>
      import('./features/maintenance/pages/maintenance-detail-page').then(
        (module) => module.MaintenanceDetailPage,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
