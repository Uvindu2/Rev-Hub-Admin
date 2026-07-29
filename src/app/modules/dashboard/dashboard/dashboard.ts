import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import {
  faCar,
  faChartLine,
  faFileLines,
  faGauge,
  faGear,
  faUserGroup,
  faWrench,
  faXRay,
  faBars, faChevronDown, faUser, faBox, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { Subscription, filter } from 'rxjs';

type View = 'dashboard' | 'job-cards' | 'invoices' | 'customers' | 'technicians' | 'vehicles' | 'items' | 'labor-activities';

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
  private routerSub!: Subscription;

  pageTitles: Record<string, string> = {
    'overview': 'Dashboard',
    'job-cards': 'Job Cards',
    'invoices': 'Invoices',
    'customers': 'Customers',
    'technicians': 'Technicians',
    'vehicles': 'Vehicles',
    'items': 'Items',
    'labor-activities': 'Labor Activities'
  };

  currentTitle: string = 'Dashboard';
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes to update the title dynamically
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });

    // Set initial title on load
    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    // Extract the segment after /dashboard/
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    this.currentTitle = this.pageTitles[lastSegment] || 'Dashboard';
  }

  get pageTitle(): string {
    return this.currentTitle;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.router.navigate(['login']);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
