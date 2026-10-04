import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars, faBox, faCar, faChartLine, faChevronDown, faClipboardList,
  faFileLines, faGauge, faUser, faUserGroup, faWrench, faXRay
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FontAwesomeModule, RouterOutlet, RouterLinkActive, RouterLink, NgIf]
})
export class Dashboard implements OnInit, OnDestroy {
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

  isSidebarCollapsed = false;
  isDropdownOpen = false;
  currentTitle = 'Dashboard';
  private routerSubscription?: Subscription;

  pageTitles: Record<string, string> = {
    overview: 'Dashboard',
    'job-cards': 'Job Cards',
    invoices: 'Invoices',
    customers: 'Customers',
    technicians: 'Technicians',
    vehicles: 'Vehicles',
    items: 'Items',
    users: 'Users',
    'labor-activities': 'Labor Activities'
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => this.updatePageTitle(event.urlAfterRedirects));

    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    if (url.includes('/dashboard/job-cards/new')) {
      this.currentTitle = 'Job Cards';
      return;
    }

    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    this.currentTitle = this.pageTitles[lastSegment] || 'Dashboard';
  }

  get pageTitle(): string {
    return this.currentTitle;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
