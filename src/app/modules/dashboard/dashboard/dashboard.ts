import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from '@angular/router';
import {JobCardView} from '../../job-card/job-card-view/job-card-view';
import {NgIf} from '@angular/common';
import {InvoiceView} from '../../invoice/invoice-view/invoice-view';
import {CustomerView} from '../../customer/customer-view/customer-view';
import {TechnicianView} from '../../technician/technician-view/technician-view';
import {VehicleView} from '../../vehicle/vehicle-view/vehicle-view';
import {
  faCar,
  faChartLine,
  faFileLines,
  faGauge, faGear,
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
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

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


type View = 'dashboard' | 'jobCards' | 'invoices' | 'customers'| 'technicians' | 'vehicles';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [JobCardView, NgIf, InvoiceView, CustomerView, TechnicianView, VehicleView, ChartComponent,FontAwesomeModule]
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

  activeView: View = 'dashboard';
  isSidebarCollapsed=false;
  faBars = faBars;
  isDropdownOpen = false;

  // Existing method to toggle sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

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

  public chartOptions: Partial<ChartOptions> = {
    series: [44, 55, 41],
    colors: ['#b30000', '#333333', '#8e8e8e'],
    chart: {
      type: 'donut',
      width: '325px',
    },
    legend: {
      show: true,
      position: 'right',
      fontSize: '15px',
      labels: {
        colors: '#ffffff',
      },
      itemMargin: {
        vertical: 5,
        horizontal: 10
      },
      markers: {
        // Replace 'radius' with 'shape'
        shape: 'square', // Options: 'circle', 'square', 'rect'
        size: 5          // You can also control the size of the marker here
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      colors: ['#121212']
    },
    // Add this block to show the total in the center
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '15px',
              color: '#fff',
              offsetY: -10
            } as any,
            value: {
              color: '#fff',
              fontSize: '22px',
              offsetY: 20
            } as any
          }
        }
      }
    },
    labels: ['Pending', 'Rejected', 'Completed'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };


  private revenueseries: any = {
    "monthDataSeries1": {
      "prices": [
        8107.85,
        8128.0,
        8122.9,
        8165.5,
        8340.7,
        8423.7,
        8423.5,
        8514.3,
        8481.85,
        8487.7,
        8506.9,
        8626.2,
        8668.95,
        8602.3,
        8607.55,
        8512.9,
        8496.25,
        8600.65,
        8881.1,
        9340.85
      ],
      "dates": [
        "13 Nov 2017",
        "14 Nov 2017",
        "15 Nov 2017",
        "16 Nov 2017",
        "17 Nov 2017",
        "20 Nov 2017",
        "21 Nov 2017",
        "22 Nov 2017",
        "23 Nov 2017",
        "24 Nov 2017",
        "27 Nov 2017",
        "28 Nov 2017",
        "29 Nov 2017",
        "30 Nov 2017",
        "01 Dec 2017",
        "04 Dec 2017",
        "05 Dec 2017",
        "06 Dec 2017",
        "07 Dec 2017",
        "08 Dec 2017"
      ]
    },
    "monthDataSeries2": {
      "prices": [
        8423.7,
        8423.5,
        8514.3,
        8481.85,
        8487.7,
        8506.9,
        8626.2,
        8668.95,
        8602.3,
        8607.55,
        8512.9,
        8496.25,
        8600.65,
        8881.1,
        9040.85,
        8340.7,
        8165.5,
        8122.9,
        8107.85,
        8128.0
      ],
      "dates": [
        "13 Nov 2017",
        "14 Nov 2017",
        "15 Nov 2017",
        "16 Nov 2017",
        "17 Nov 2017",
        "20 Nov 2017",
        "21 Nov 2017",
        "22 Nov 2017",
        "23 Nov 2017",
        "24 Nov 2017",
        "27 Nov 2017",
        "28 Nov 2017",
        "29 Nov 2017",
        "30 Nov 2017",
        "01 Dec 2017",
        "04 Dec 2017",
        "05 Dec 2017",
        "06 Dec 2017",
        "07 Dec 2017",
        "08 Dec 2017"
      ]
    },
    "monthDataSeries3": {
      "prices": [
        7114.25,
        7126.6,
        7116.95,
        7203.7,
        7233.75,
        7451.0,
        7381.15,
        7348.95,
        7347.75,
        7311.25,
        7266.4,
        7253.25,
        7215.45,
        7266.35,
        7315.25,
        7237.2,
        7191.4,
        7238.95,
        7222.6,
        7217.9,
        7359.3,
        7371.55,
        7371.15,
        7469.2,
        7429.25,
        7434.65,
        7451.1,
        7475.25,
        7566.25,
        7556.8,
        7525.55,
        7555.45,
        7560.9,
        7490.7,
        7527.6,
        7551.9,
        7514.85,
        7577.95,
        7592.3,
        7621.95,
        7707.95,
        7859.1,
        7815.7,
        7739.0,
        7778.7,
        7839.45,
        7756.45,
        7669.2,
        7580.45,
        7452.85,
        7617.25,
        7701.6,
        7606.8,
        7620.05,
        7513.85,
        7498.45,
        7575.45,
        7601.95,
        7589.1,
        7525.85,
        7569.5,
        7702.5,
        7812.7,
        7803.75,
        7816.3,
        7851.15,
        7912.2,
        7972.8,
        8145.0,
        8161.1,
        8121.05,
        8071.25,
        8088.2,
        8154.45,
        8148.3,
        8122.05,
        8132.65,
        8074.55,
        7952.8,
        7885.55,
        7733.9,
        7897.15,
        7973.15,
        7888.5,
        7842.8,
        7838.4,
        7909.85,
        7892.75,
        7897.75,
        7820.05,
        7904.4,
        7872.2,
        7847.5,
        7849.55,
        7789.6,
        7736.35,
        7819.4,
        7875.35,
        7871.8,
        8076.5,
        8114.8,
        8193.55,
        8217.1,
        8235.05,
        8215.3,
        8216.4,
        8301.55,
        8235.25,
        8229.75,
        8201.95,
        8164.95,
        8107.85,
        8128.0,
        8122.9,
        8165.5,
        8340.7,
        8423.7,
        8423.5,
        8514.3,
        8481.85,
        8487.7,
        8506.9,
        8626.2
      ],
      "dates": [
        "02 Jun 2017",
        "05 Jun 2017",
        "06 Jun 2017",
        "07 Jun 2017",
        "08 Jun 2017",
        "09 Jun 2017",
        "12 Jun 2017",
        "13 Jun 2017",
        "14 Jun 2017",
        "15 Jun 2017",
        "16 Jun 2017",
        "19 Jun 2017",
        "20 Jun 2017",
        "21 Jun 2017",
        "22 Jun 2017",
        "23 Jun 2017",
        "27 Jun 2017",
        "28 Jun 2017",
        "29 Jun 2017",
        "30 Jun 2017",
        "03 Jul 2017",
        "04 Jul 2017",
        "05 Jul 2017",
        "06 Jul 2017",
        "07 Jul 2017",
        "10 Jul 2017",
        "11 Jul 2017",
        "12 Jul 2017",
        "13 Jul 2017",
        "14 Jul 2017",
        "17 Jul 2017",
        "18 Jul 2017",
        "19 Jul 2017",
        "20 Jul 2017",
        "21 Jul 2017",
        "24 Jul 2017",
        "25 Jul 2017",
        "26 Jul 2017",
        "27 Jul 2017",
        "28 Jul 2017",
        "31 Jul 2017",
        "01 Aug 2017",
        "02 Aug 2017",
        "03 Aug 2017",
        "04 Aug 2017",
        "07 Aug 2017",
        "08 Aug 2017",
        "09 Aug 2017",
        "10 Aug 2017",
        "11 Aug 2017",
        "14 Aug 2017",
        "16 Aug 2017",
        "17 Aug 2017",
        "18 Aug 2017",
        "21 Aug 2017",
        "22 Aug 2017",
        "23 Aug 2017",
        "24 Aug 2017",
        "28 Aug 2017",
        "29 Aug 2017",
        "30 Aug 2017",
        "31 Aug 2017",
        "01 Sep 2017",
        "04 Sep 2017",
        "05 Sep 2017",
        "06 Sep 2017",
        "07 Sep 2017",
        "08 Sep 2017",
        "11 Sep 2017",
        "12 Sep 2017",
        "13 Sep 2017",
        "14 Sep 2017",
        "15 Sep 2017",
        "18 Sep 2017",
        "19 Sep 2017",
        "20 Sep 2017",
        "21 Sep 2017",
        "22 Sep 2017",
        "25 Sep 2017",
        "26 Sep 2017",
        "27 Sep 2017",
        "28 Sep 2017",
        "29 Sep 2017",
        "03 Oct 2017",
        "04 Oct 2017",
        "05 Oct 2017",
        "06 Oct 2017",
        "09 Oct 2017",
        "10 Oct 2017",
        "11 Oct 2017",
        "12 Oct 2017",
        "13 Oct 2017",
        "16 Oct 2017",
        "17 Oct 2017",
        "18 Oct 2017",
        "19 Oct 2017",
        "23 Oct 2017",
        "24 Oct 2017",
        "25 Oct 2017",
        "26 Oct 2017",
        "27 Oct 2017",
        "30 Oct 2017",
        "31 Oct 2017",
        "01 Nov 2017",
        "02 Nov 2017",
        "03 Nov 2017",
        "06 Nov 2017",
        "07 Nov 2017",
        "08 Nov 2017",
        "09 Nov 2017",
        "10 Nov 2017",
        "13 Nov 2017",
        "14 Nov 2017",
        "15 Nov 2017",
        "16 Nov 2017",
        "17 Nov 2017",
        "20 Nov 2017",
        "21 Nov 2017",
        "22 Nov 2017",
        "23 Nov 2017",
        "24 Nov 2017",
        "27 Nov 2017",
        "28 Nov 2017"
      ]
    }
  };

  public revenueChartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Revenue',
        data: this.revenueseries.monthDataSeries1.prices,
      },
    ],
    chart: {
      type: 'area', // This was missing and caused your error
      height: 150,
      toolbar: {
        show: false
      },
      zoom: { enabled: false }
    },
    colors: ['#b30000'],
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#b30000'] // Explicitly setting stroke color
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0
      }
    },
    labels: this.revenueseries.monthDataSeries1.dates,
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      opposite: true,
      tickAmount: 2,
      labels: {
        show: true,
        align: 'left',
        formatter: (val) => val.toFixed(0) // Forces whole numbers
      }
    },
    legend: {
      horizontalAlign: 'left',
    },
    dataLabels: { enabled: false },
  };

  public filterRevenue(range: 'week' | 'month' | 'year') {
    const now = new Date();

    // 1. Calculate the start date for the filter
    let startDate = new Date();
    if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
  }
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

   logout() {

    }
}
