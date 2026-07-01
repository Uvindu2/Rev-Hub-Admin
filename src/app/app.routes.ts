import { Routes } from '@angular/router';
import {Dashboard} from './modules/dashboard/dashboard/dashboard';
import {JobCardView} from './modules/job-card/job-card-view/job-card-view';
import {CustomerView} from './modules/customer/customer-view/customer-view';
import {TechnicianView} from './modules/technician/technician-view/technician-view';
import {VehicleView} from './modules/vehicle/vehicle-view/vehicle-view';
import {InvoiceView} from './modules/invoice/invoice-view/invoice-view';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'job-card-view', component: JobCardView},
  { path: 'invoice-view', component: InvoiceView},
  { path: 'customer-view', component: CustomerView},
  { path: 'technician-view', component: TechnicianView},
  { path: 'vehicle-view', component: VehicleView},
];
