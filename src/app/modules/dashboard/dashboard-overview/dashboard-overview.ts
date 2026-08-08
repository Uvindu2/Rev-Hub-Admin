import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import {JobCardView} from '../../job-card/job-card-view/job-card-view';
import {InvoiceView} from '../../invoice/invoice-view/invoice-view';
import {CustomerView} from '../../customer/customer-view/customer-view';
import {TechnicianView} from '../../technician/technician-view/technician-view';
import {VehicleView} from '../../vehicle/vehicle-view/vehicle-view';
import {LowerCasePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {finalize, forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AdminService} from '../../../services/admin.service';
import {JobCardStatusProjection} from '../../../dto/response/JobCardStatusProjection';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faXRay} from '@fortawesome/free-solid-svg-icons';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  colors?: string[];
  labels?: any;
};

type View = 'dashboard' | 'jobCards' | 'invoices' | 'customers' | 'technicians' | 'vehicles';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    ChartComponent,
    JobCardView,
    InvoiceView,
    CustomerView,
    TechnicianView,
    VehicleView,
    NgIf,
    RouterLink,
    NgForOf,
    NgClass,
    LowerCasePipe
  ],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DashboardOverview implements OnInit {

  // Map icons to properties
  activeView: View = 'dashboard';
  isLoading = true;
  isRevenueLoading = false;
  customersCount: any;
  jobCardStatus: JobCardStatusProjection | undefined;
  recentJobCards: any;
  recentInvoices: any;
  topLaborActivities: any = [];
  invoicesCount: any;
  jobCardsCount: any;
  revenue: any;
// Define revenueChartData property
  revenueChartData: any = {
    prices: [],
    dates: [],
    totalRevenue: 0
  };

  constructor(private dashboardApi: AdminService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    console.log('DashboardOverview ngOnInit triggered!');
    this.loadAllDashboardApis();
  }

  private loadAllDashboardApis(): void {
    this.isLoading = true;
    console.log('Firing forkJoin for dashboard APIs...');

    forkJoin({
      customersCount: this.dashboardApi.getAllCustomersCount().pipe(catchError(() => of(null))),
      jobCardStatus: this.dashboardApi.getAllJobCardStatus().pipe(catchError(() => of(null))),
      recentJobCards: this.dashboardApi.getRecentJobCards().pipe(catchError(() => of(null))),
      recentInvoices: this.dashboardApi.getRecentInvoices().pipe(catchError(() => of(null))),
      topLaborActivities: this.dashboardApi.getTopLaborActivities().pipe(catchError(() => of(null))),
      invoicesCount: this.dashboardApi.getInvoicesCount().pipe(catchError(() => of(null))),
      jobCardsCount: this.dashboardApi.getJobCardsCount().pipe(catchError(() => of(null))),
      revenue: this.dashboardApi.getRevenue().pipe(catchError(() => of(null))),
      chartData: this.dashboardApi.getRevenueChartData('MONTH').pipe(catchError((err) => {
          console.error('Revenue chart API failed safely via catchError:', err);
          return of(null);
        })
      )
    }).pipe(

      finalize(() => {

        // Always stop global loader
        this.isLoading = false;

        this.cdr.detectChanges();

      })

    ).subscribe({
      next: (res) => {
        console.log('forkJoin successfully completed with responses:', res);

        this.customersCount = res.customersCount?.data ?? res.customersCount;
        this.jobCardStatus = res.jobCardStatus?.data ?? res.jobCardStatus;
        this.recentJobCards = res.recentJobCards?.data ?? res.recentJobCards;
        this.recentInvoices = res.recentInvoices?.data ?? res.recentInvoices;
        this.topLaborActivities = res.topLaborActivities?.data ?? res.topLaborActivities;
        this.invoicesCount = res.invoicesCount?.data ?? res.invoicesCount;
        this.jobCardsCount = res.jobCardsCount?.data ?? res.jobCardsCount;
        this.revenue = res.revenue?.data ?? res.revenue;
        this.revenueChartData = res.chartData?.data ?? res.chartData;
        if (this.jobCardStatus) {
          this.chartOptions = {
            ...this.chartOptions,
            series: [
              this.jobCardStatus.pendingCount || 0,
              this.jobCardStatus.rejectedCount || 0,
              this.jobCardStatus.completedCount || 0
            ]
          };
        }

        if (this.revenueChartData) {
          this.revenueChartOptions = {
            ...this.revenueChartOptions,
            series: [{name: 'Revenue', data: this.revenueChartData.prices || []}],
            labels: this.revenueChartData.dates || []
          };
        }
        console.log('Job Cards Count:', this.revenueChartData.totalRevenue);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('*** FORKJOIN ERROR CAUGHT ***', err);
        this.isLoading = false;
      }
    });
  }

  setActive(view: View) {
    this.activeView = view;
  }

  // 2. Chart Configuration

  public chartOptions: Partial<ChartOptions> = {
    series: [],
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
          chart: {width: 200},
          legend: {position: 'bottom'},
        },
      },
    ],
  };

  public revenueChartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Revenue',
        data: this.revenueChartData?.prices || [],
      },
    ],
    chart: {
      type: 'area',
      height: 150,
      toolbar: {
        show: false
      },
      zoom: {enabled: false}
    },
    colors: ['#b30000'],
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#b30000']
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0
      }
    },
    labels: this.revenueChartData?.dates || [],
    xaxis: {
      // Change from 'datetime' to 'category' so text labels like month names or numbers render properly for all filters
      type: 'category'
    },
    yaxis: {
      opposite: true,
      tickAmount: 2,
      labels: {
        show: true,
        align: 'left',
        formatter: (val) => (val != null ? val.toFixed(0) : '0')
      }
    },
    legend: {
      horizontalAlign: 'left',
    },
    dataLabels: {enabled: false},
  };


  public filterRevenue(range: 'week' | 'month' | 'year') {
    const filterValue = range.toUpperCase(); // Matches backend RevenueFilter enum (WEEK, MONTH, YEAR)

    this.isRevenueLoading = true;
    this.dashboardApi.getRevenueChartData(filterValue).pipe(

      catchError((err) => {

        console.error(
          'Failed to fetch revenue chart data:',
          err
        );

        return of(null);

      }),

      finalize(() => {

        this.isRevenueLoading = false;

        this.cdr.detectChanges();

      })

    ).subscribe({
      next: (res) => {
        const chartData = res?.data || res;
        if (chartData) {
          // Updates the total revenue dynamically based on the selected filter
          this.revenueChartData.totalRevenue = chartData.totalRevenue;
          console.log(chartData.totalRevenue);
          // Updates the ApexCharts series and labels
          this.revenueChartOptions = {
            ...this.revenueChartOptions,
            series: [{name: 'Revenue', data: chartData.prices || []}],
            labels: chartData.dates || chartData.labels || []
          };
        }
        this.isRevenueLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error in filterRevenue subscription:', err);
        this.isRevenueLoading = false;
      }
    });
  }
}
