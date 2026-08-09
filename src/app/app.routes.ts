import { Routes } from '@angular/router';
import { authGuard } from './modules/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () => import('./modules/login/login/login').then(m => m.Login)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/dashboard/dashboard/dashboard').then(m => m.Dashboard),
    children: [

      {
        path: 'overview',
        loadComponent: () => import('./modules/dashboard/dashboard-overview/dashboard-overview').then(m => m.DashboardOverview)
      },

      {
        path: 'job-cards',
        loadComponent: () => import('./modules/job-card/job-card-view/job-card-view').then(m => m.JobCardView)
      },

      {
        path: 'invoices',
        loadComponent: () => import('./modules/invoice/invoice-view/invoice-view').then(m => m.InvoiceView)
      },

      {
        path: 'customers',
        loadComponent: () => import('./modules/customer/customer-view/customer-view').then(m => m.CustomerView)
      },

      {
        path: 'technicians',
        loadComponent: () => import('./modules/technician/technician-view/technician-view').then(m => m.TechnicianView)
      },

      {
        path: 'vehicles',
        loadComponent: () => import('./modules/vehicle/vehicle-view/vehicle-view').then(m => m.VehicleView)
      },

      {
        path: 'items',
        loadComponent: () => import('./modules/item/item-view/item-view').then(m => m.ItemView)
      },

      {
        path: 'labor-activities',
        loadComponent: () => import('./modules/labor-activity/labor-activity-view/labor-activity-view').then(m => m.LaborActivityView)
      },

      {
        path: 'users',
        loadComponent: () => import('./modules/user/user-view/user-view').then(m => m.UserView)
      },

      // Default dashboard page
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }

    ]
  },

  // Default route
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Invalid URL
  {
    path: '**',
    redirectTo: 'login'
  }

];
