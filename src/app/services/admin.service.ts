import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Customer} from '../modules/vehicle/vehicle-view/vehicle-view';
import {API_ENDPOINTS} from '../constant/api-endpoints';
import {VehicleAndCustomerDTO} from '../dto/response/VehicleAndCustomerDTO';
import {TechnicianNameProjection} from '../dto/response/TechnicianNameProjection';
import {LaborActivityNameProjection} from '../dto/response/LaborActivityNameProjection';
import {ItemProjection} from '../dto/response/ItemProjection';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private readonly http: HttpClient) {
  }

  // GET ALL CUSTOMERS
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(API_ENDPOINTS.GET_ALL);
  }

  // GET BY DRIVING LICENSE (PATH PARAM)
  getCustomerByDrivingLicenseNumber(licenseNumber: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(
      API_ENDPOINTS.GET_BY_LICENSE(licenseNumber)
    );
  }

  // GET BY DRIVING LICENSE (PATH PARAM)
  getVehicleAndCustomerByVehicleRegNumber(vehicleRegNumber: string): Observable<VehicleAndCustomerDTO[]> {
    return this.http.get<VehicleAndCustomerDTO[]>(
      API_ENDPOINTS.GET_BY_VEHICLE_REG_NUMBER(vehicleRegNumber)
    );
  }

  getTechnicianNames(): Observable<TechnicianNameProjection[]> {
    return this.http.get<TechnicianNameProjection[]>(API_ENDPOINTS.GET_TECHNICIAN_NAMES);
  }

  getLaborActivityNames(): Observable<LaborActivityNameProjection[]> {
    return this.http.get<LaborActivityNameProjection[]>(API_ENDPOINTS.GET_LABOR_ACTIVITY_NAMES);
  }

  getItemParts(): Observable<ItemProjection[]> {
    return this.http.get<ItemProjection[]>(API_ENDPOINTS.GET_ITEM_PASRTS);
  }

  /**
   * Submits the Job Card transactional details and intercepts
   * the server response as a raw raw binary file Stream.
   */

  saveJobCardBlobVariant(jobCardData: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_JOB_CARD, jobCardData);
  }

// Add this method to your AdminService class
  getJobCardsPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_JOB_CARDS(page, size, sortBy, sortDir));
  }

  // Add this method to your AdminService class
  getInvoiceSummaryPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_INVOICE_SUMMARIES(page, size, sortBy, sortDir));
  }

  getLaborActivitiesByJobId(jobId: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_LABOR_ACTIVITIES_BY_JOB_ID(jobId));
  }

  saveInvoice(payload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_INVOICE, payload);
  }

  getCustomersPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_CUSTOMERS(page, size, sortBy, sortDir));
  }
}
