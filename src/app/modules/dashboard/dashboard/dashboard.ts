import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { JobCardView } from '../../job-card/job-card-view/job-card-view';
import { NgIf } from '@angular/common';
import {InvoiceView} from '../../invoice/invoice-view/invoice-view';
import {CustomerView} from '../../customer/customer-view/customer-view';
import {TechnicianView} from '../../technician/technician-view/technician-view';
import {VehicleView} from '../../vehicle/vehicle-view/vehicle-view';
import {    ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme} from 'ng-apexcharts';

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
  imports: [JobCardView, NgIf, InvoiceView, CustomerView, TechnicianView, VehicleView, ChartComponent]
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

  public chartOptions: Partial<ChartOptions> = {
    series: [44, 55, 41],
    colors: ['#b30000', '#333333', '#8e8e8e'],
    chart: {
      type: 'donut',
      width: '325px',
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

  private series: any = {
    "monthDataSeries1": {
      "prices": [
        2000,
      ],
      "dates": [
        "13 Nov 2017",
      ]
    }
  };

  public revenueChartOptions: Partial<ChartOptions> = {
    // 1. You MUST include the chart property
    chart: {
      type: 'area', // This was missing and caused your error
      height: 150,
      toolbar: {
        show: false
      },
      zoom: { enabled: false }
    },
    series: [
      {
        name: 'Revenue',
        data: this.series.monthDataSeries1.prices.slice(0, 3),
      },
    ],
    labels: this.series.monthDataSeries1.dates.slice(0, 3),
    // 2. Ensure these exist if you are passing them in HTML
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
    grid: {
      padding: {
        left: 0,
        right: 0
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'straight' }
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

    // 2. Filter your master data (e.g., allRevenueData)

    // 3. Update the chart configuration
  }
}
