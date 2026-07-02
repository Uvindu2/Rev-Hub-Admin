import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  faCar,
  faChartLine,
  faFileLines,
  faGauge,
  faGear,
  faUserGroup,
  faWrench,
  faXRay,
  faBars, faChevronDown, faUser
} from '@fortawesome/free-solid-svg-icons';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};


type View = 'dashboard' | 'jobCards' | 'invoices' | 'customers' | 'technicians' | 'vehicles';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FontAwesomeModule, RouterOutlet, RouterLinkActive, RouterLink, NgIf]
})

export class Dashboard {

// Map icons to properties

  // Map icons to properties
  faDashboard = faGauge;
  faXRay = faXRay;
  faFileLines = faFileLines;
  faUsers = faUserGroup;
  faWrench = faWrench;
  faCar = faCar;
  faReports = faChartLine;
  faSettings = faGear;
  faChevronDown = faChevronDown;
  faUser = faUser;
  faBars = faBars;

  activeView: View = 'dashboard';
  isSidebarCollapsed = false;
  isDropdownOpen = false;

  constructor() {
  }

  // Existing method to toggle sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {

  }
}
