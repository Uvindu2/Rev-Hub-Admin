import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_ENDPOINTS} from '../constant/api-endpoints';
import {VehicleAndCustomerDTO} from '../dto/response/VehicleAndCustomerDTO';
import {TechnicianNameProjection} from '../dto/response/TechnicianNameProjection';
import {LaborActivityNameProjection} from '../dto/response/LaborActivityNameProjection';
import {ItemProjection} from '../dto/response/ItemProjection';
import {CustomerProjection} from '../dto/response/CustomerProjection';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private readonly http: HttpClient) {
  }

  // GET BY DRIVING LICENSE (PATH PARAM)
  getCustomerByContactNumber(contactNumber: string): Observable<CustomerProjection[]> {
    return this.http.get<CustomerProjection[]>(
      API_ENDPOINTS.GET_BY_CONTACT_NUMBER(contactNumber)
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

  modifyJobCardBlobVariant(jobCardData: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_JOB_CARD, jobCardData);
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

  getVehiclesPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_VEHICLE_SUMMARIES(page, size, sortBy, sortDir));
  }

  getJobCardById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_JOB_CARD_BY_ID(id));
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ITEM_BY_ID(id));
  }

  getItemsPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_ITEMS(page, size, sortBy, sortDir));
  }

  getLaborActivitiesPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_LABOR_ACTIVITIES(page, size, sortBy, sortDir));
  }

  getLaborActivityById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_LABOR_ACTIVITY_BY_ID(id));
  }

  saveLaborActivity(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_LABOR_ACTIVITY, backendPayload);
  }

  saveItem(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_ITEM, backendPayload);
  }

  modifyItem(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_ITEM, backendPayload);
  }

  modifyLaborActivity(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_LABOR_ACTIVITY, backendPayload);
  }

  getTechniciansPaginated(page: number, size: number, sortBy: string, sortDir: string): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_TECHNICIANS(page, size, sortBy, sortDir));
  }

  getTechnicianById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_TECHNICIAN_BY_ID(id));
  }

  saveTechnician(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_TECHNICIAN, backendPayload);
  }

  modfiyTechnician(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.MODIFY_TECHNICIAN, backendPayload);
  }

  getVehicleById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_VEHICLE_BY_ID(id));
  }

  modifyVehicle(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_VEHICLE, backendPayload);
  }

  modifyCustomer(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_CUSTOMER, backendPayload);
  }

  getCustomerById(customerId: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_CUSTOMER_BY_ID(customerId));
  }

  viewInvoice(invoiceId: number): Observable<Blob> {
    // Use 'blob' to handle binary PDF data
    return this.http.get(API_ENDPOINTS.VIEW_INVOICE_BY_ID(invoiceId), {
      responseType: 'blob'
    });
  }
}
