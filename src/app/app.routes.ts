import { Routes } from '@angular/router';

import { Dashboard } from './modules/dashboard/dashboard/dashboard';
import { JobCardView } from './modules/job-card/job-card-view/job-card-view';
import { CustomerView } from './modules/customer/customer-view/customer-view';
import { TechnicianView } from './modules/technician/technician-view/technician-view';
import { VehicleView } from './modules/vehicle/vehicle-view/vehicle-view';
import { InvoiceView } from './modules/invoice/invoice-view/invoice-view';
import { DashboardOverview } from './modules/dashboard/dashboard-overview/dashboard-overview';
import { ItemView } from './modules/item/item-view/item-view';
import { LaborActivityView } from './modules/labor-activity/labor-activity-view/labor-activity-view';
import { Login } from './modules/login/login/login';
import { UserView } from './modules/user/user-view/user-view';
import {authGuard} from './modules/guards/auth.guard';


export const routes: Routes = [

  // Login page
  {
    path: 'login',
    component: Login
  },


  // Protected dashboard
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],

    children: [

      {
        path: 'overview',
        component: DashboardOverview
      },

      {
        path: 'job-cards',
        component: JobCardView
      },

      {
        path: 'invoices',
        component: InvoiceView
      },

      {
        path: 'customers',
        component: CustomerView
      },

      {
        path: 'technicians',
        component: TechnicianView
      },

      {
        path: 'vehicles',
        component: VehicleView
      },

      {
        path: 'items',
        component: ItemView
      },

      {
        path: 'labor-activities',
        component: LaborActivityView
      },

      {
        path: 'users',
        component: UserView
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
