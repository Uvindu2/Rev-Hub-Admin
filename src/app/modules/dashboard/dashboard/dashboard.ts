import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JobCardView } from '../../job-card/job-card-view/job-card-view';
import { NgIf } from '@angular/common';
import {InvoiceView} from '../../invoice/invoice-view/invoice-view';
import {CustomerView} from '../../customer/customer-view/customer-view';
import {TechnicianView} from '../../technician/technician-view/technician-view';
import {VehicleView} from '../../vehicle/vehicle-view/vehicle-view';

type View = 'dashboard' | 'jobCards' | 'invoices' | 'customers'| 'technicians' | 'vehicles';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  imports: [JobCardView, NgIf, InvoiceView, CustomerView, TechnicianView, VehicleView]
})
export class Dashboard {

  activeView: View = 'dashboard';

  constructor(private readonly router: Router) {}

  setActive(view: View) {
    this.activeView = view;
  }

  pageTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    jobCards: 'Job Cards',
    invoices: 'Invoices',
    customers: 'Customers',
    technicians: 'Technicians',
    vehicles: 'Vehicles',
  };

  get pageTitle(): string {
    return this.pageTitles[this.activeView];
  }

  // Static data arrays
  recentJobs = [
    { id: 'JC-0012', customer: 'Nimal Perera', status: 'In Progress' },
    { id: 'JC-0011', customer: 'Kamal Fernando', status: 'Pending' },
    { id: 'JC-0010', customer: 'Saman Jayawardena', status: 'Completed' }
  ];

  topServices = [
    { name: 'Engine Repair', count: 18 },
    { name: 'Brake Service', count: 15 },
    { name: 'Oil Change', count: 12 }
  ];
}
