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
  faBars, faChevronDown, faUser,faBox,faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';

type View = 'dashboard' | 'jobCards' | 'invoices' | 'customers' | 'technicians' | 'vehicles' | 'items' | 'laborActivities';

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
  faChevronDown = faChevronDown;
  faUser = faUser;
  faBars = faBars;
  faBox = faBox;
  faClipboardList = faClipboardList;
  activeView: View = 'dashboard';
  isSidebarCollapsed = false;
  isDropdownOpen = false;

  constructor(
        private router: Router
  ) {
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
    items: 'Items',
    laborActivities: 'Labor Activities'
  };

  get pageTitle(): string {
    return this.pageTitles[this.activeView];
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
      this.router.navigate(['login']);
  }
}
