import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard/dashboard').then(m => m.Dashboard),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./modules/dashboard/dashboard-overview/dashboard-overview').then(m => m.DashboardOverview)
      },
      {
        path: 'job-cards/new', loadComponent: () => import('./modules/job-card/job-card-form/job-card-form').then(m => m.JobCardForm)
      },
      {
        path: 'job-cards/print',
        loadComponent: () => import('./modules/invoice/print-preview/print-preview').then(m => m.PrintPreview)
      },
      {
        path: 'job-cards/edit/:id',
        loadComponent: () => import('./modules/job-card/job-card-view-and-edit/job-card-view-and-edit').then(m => m.JobCardViewAndEdit)
      },
      {
        path: 'job-cards', loadComponent: () => import('./modules/job-card/job-card-view/job-card-view').then(m => m.JobCardView)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./modules/invoice/invoice-view/invoice-view').then(m => m.InvoiceView)
      },
      {
        path: 'invoices/new', loadComponent: () => import('./modules/invoice/invoice-form/invoice-form').then(m => m.InvoiceForm)
      },
      {
        path: 'invoices/edit/:id',
        loadComponent: () => import('./modules/invoice/invoice-view-and-edit/invoice-view-and-edit').then(m => m.InvoiceViewAndEdit)
      },
      {
        path: 'invoices/print',
        loadComponent: () => import('./modules/invoice/print-preview/print-preview').then(m => m.PrintPreview)
      },
      {
        path: 'customers',
        loadComponent: () => import('./modules/customer/customer-view/customer-view').then(m => m.CustomerView)
      },
      {
        path: 'customers/edit/:id',
        loadComponent: () => import('./modules/customer/customer-view-and-edit/customer-view-and-edit').then(m => m.CustomerViewAndEdit)
      },
      {
        path: 'customers/view/:id',
        loadComponent: () => import('./modules/customer/customer-view-and-edit/customer-view-and-edit').then(m => m.CustomerViewAndEdit)
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
        path: 'vehicles/view/:id',
        loadComponent: () => import('./modules/vehicle/vehicle-edit-form/vehicle-edit-form').then(m => m.VehicleEditFormComponent)
      },
      {
        path: 'vehicles/edit/:id',
        loadComponent: () => import('./modules/vehicle/vehicle-edit-form/vehicle-edit-form').then(m => m.VehicleEditFormComponent)
      },
      {
        path: 'items/new',
        loadComponent: () => import('./modules/item/item-form/item-form').then(m => m.ItemForm)
      },
      {
        path: 'items/view/:id',
        loadComponent: () => import('./modules/item/item-view-and-edit/item-view-and-edit').then(m => m.ItemViewAndEdit)
      },
      {
        path: 'items/edit/:id',
        loadComponent: () => import('./modules/item/item-view-and-edit/item-view-and-edit').then(m => m.ItemViewAndEdit)
      },
      {
        path: 'items',
        loadComponent: () => import('./modules/item/item-view/item-view').then(m => m.ItemView)
      },
      {
        path: 'labor-activities/new',
        loadComponent: () => import('./modules/labor-activity/labor-activity-form/labor-activity-form').then(m => m.LaborActivityForm)
      },
      {
        path: 'labor-activities/view/:id',
        loadComponent: () => import('./modules/labor-activity/labor-activity-view-and-edit/labor-activity-view-and-edit').then(m => m.LaborActivityViewAndEdit)
      },
      {
        path: 'labor-activities/edit/:id',
        loadComponent: () => import('./modules/labor-activity/labor-activity-view-and-edit/labor-activity-view-and-edit').then(m => m.LaborActivityViewAndEdit)
      },
      {
        path: 'labor-activities',
        loadComponent: () => import('./modules/labor-activity/labor-activity-view/labor-activity-view').then(m => m.LaborActivityView)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./modules/user/user-form/user-form').then(m => m.UserForm)
      },
      {
        path: 'users/view/:id',
        loadComponent: () => import('./modules/user/user-view-and-edit/user-view-and-edit').then(m => m.UserViewAndEdit)
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./modules/user/user-view-and-edit/user-view-and-edit').then(m => m.UserViewAndEdit)
      },
      {
        path: 'users',
        loadComponent: () => import('./modules/user/user-view/user-view').then(m => m.UserView)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./modules/change-password/change-password').then(m => m.ChangePassword)
      }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
