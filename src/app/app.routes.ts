import { Routes } from '@angular/router';
import {Dashboard} from './modules/dashboard/dashboard/dashboard';
import {JobCardView} from './modules/job-card/job-card-view/job-card-view';
import {CustomerView} from './modules/customer/customer-view/customer-view';
import {TechnicianView} from './modules/technician/technician-view/technician-view';
import {VehicleView} from './modules/vehicle/vehicle-view/vehicle-view';
import {InvoiceView} from './modules/invoice/invoice-view/invoice-view';
import {DashboardOverview} from './modules/dashboard/dashboard-overview/dashboard-overview';

// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/overview', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: 'overview', component: DashboardOverview },
      { path: 'job-cards', component: JobCardView },
      { path: 'invoices', component: InvoiceView },
      { path: 'customers', component: CustomerView },
      { path: 'technicians', component: TechnicianView },
      { path: 'vehicles', component: VehicleView }
    ]
  }
];
