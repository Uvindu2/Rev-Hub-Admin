import { Routes } from '@angular/router';
import {Dashboard} from './modules/dashboard/dashboard/dashboard';
import {JobCardView} from './modules/job-card/job-card-view/job-card-view';
import {CustomerView} from './modules/customer/customer-view/customer-view';
import {TechnicianView} from './modules/technician/technician-view/technician-view';
import {VehicleView} from './modules/vehicle/vehicle-view/vehicle-view';
import {InvoiceView} from './modules/invoice/invoice-view/invoice-view';
import {DashboardOverview} from './modules/dashboard/dashboard-overview/dashboard-overview';
import {ItemView} from './modules/item/item-view/item-view';
import {LaborActivityView} from './modules/labor-activity/labor-activity-view/labor-activity-view';
import { Login } from './modules/login/login/login';

// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/overview', pathMatch: 'full' },
  // 2. Define your login route (ensure you import your LoginComponent)
  { path: 'login', component: Login },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: 'overview', component: DashboardOverview },
      { path: 'job-cards', component: JobCardView },
      { path: 'invoices', component: InvoiceView },
      { path: 'customers', component: CustomerView },
      { path: 'technicians', component: TechnicianView },
      { path: 'vehicles', component: VehicleView },
      { path: 'items', component: ItemView },
      { path: 'labor-activities', component: LaborActivityView }
    ]
  }
];
