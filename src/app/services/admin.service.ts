import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constant/api-endpoints';
import { VehicleAndCustomerDTO } from '../dto/response/VehicleAndCustomerDTO';
import { TechnicianNameProjection } from '../dto/response/TechnicianNameProjection';
import { LaborActivityNameProjection } from '../dto/response/LaborActivityNameProjection';
import { ItemProjection } from '../dto/response/ItemProjection';
import { CustomerProjection } from '../dto/response/CustomerProjection';
import { RoleNameDTO } from '../dto/response/RoleNameDTO';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  // GET BY DRIVING LICENSE (PATH PARAM)
  getCustomerByContactNumber(contactNumber: string): Observable<CustomerProjection[]> {
    return this.http.get<CustomerProjection[]>(API_ENDPOINTS.GET_BY_CONTACT_NUMBER(contactNumber));
  }

  getVehicleAndCustomerByVehicleRegNumber(
    vehicleRegNumber: string,
  ): Observable<VehicleAndCustomerDTO[]> {
    return this.http.get<VehicleAndCustomerDTO[]>(
      API_ENDPOINTS.GET_BY_VEHICLE_REG_NUMBER(vehicleRegNumber),
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

  saveJobCardBlobVariant(jobCardData: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_JOB_CARD, jobCardData);
  }

  modifyJobCardBlobVariant(jobCardData: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_JOB_CARD, jobCardData);
  }

  // Add this method to your AdminService class
  getJobCardsPaginated(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_JOB_CARDS(page, size, sortBy, sortDir));
  }

  // Add this method to your AdminService class
  getInvoiceSummaryPaginated(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_INVOICE_SUMMARIES(page, size, sortBy, sortDir));
  }

  getLaborActivitiesByJobId(jobId: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_LABOR_ACTIVITIES_BY_JOB_ID(jobId));
  }

  saveInvoice(payload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_INVOICE, payload);
  }

  getCustomersPaginated(
    formValues: any,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.GET_ALL_CUSTOMERS(page, size, sortBy, sortDir),
      formValues,
    );
  }

  getVehiclesPaginated(
    formValues: any,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.GET_ALL_VEHICLE_SUMMARIES(page, size, sortBy, sortDir),
      formValues,
    );
  }

  getJobCardById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_JOB_CARD_BY_ID(id));
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ITEM_BY_ID(id));
  }

getItemsPaginated(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    itemId?: number | null
  ): Observable<any> {
    const sort = `${sortBy},${sortDir.toLowerCase()}`;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (itemId != null) {
      params = params.set('itemId', itemId.toString());
    }

    return this.http.post<any>(API_ENDPOINTS.GET_ALL_ITEMS, null, { params });
  }

getLaborActivitiesPaginated(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    laborActivityId?: number | null,
  ): Observable<any> {
    const sort = `${sortBy},${sortDir.toLowerCase()}`;

    let params = new HttpParams();
    if (laborActivityId != null) {
      params = params.set('laborActivityId', laborActivityId.toString());
    }

    return this.http.post<any>(
      API_ENDPOINTS.GET_ALL_LABOR_ACTIVITIES(page, size, sort),
      null,
      { params }
    );
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

  searchTechniciansPaginated(
    formValues: any,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.SEARCH_ALL_TECHNICIANS(page, size, sortBy, sortDir),
      formValues,
    );
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
      responseType: 'blob',
    });
  }
  getVehicleAndCustomerByVehicleVinNumber(
    vehicleVinNumber: string,
  ): Observable<VehicleAndCustomerDTO[]> {
    return this.http.get<VehicleAndCustomerDTO[]>(
      API_ENDPOINTS.GET_BY_VEHICLE_VIN_NUMBER(vehicleVinNumber),
    );
  }

  searchJobCards(
    formValues: any,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.SEARCH_JOB_CARDS(page, size, sortBy, sortDir),
      formValues,
    );
  }

  searchInvoices(
    formValues: any,
    backendPage: number,
    pageSize: number,
    sortByField: string,
    sortDirection: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_ENDPOINTS.SEARCH_INVOICES(backendPage, pageSize, sortByField, sortDirection),
      formValues,
    );
  }

  getAllVehicleRegNos(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_VEHICLE_REG_NOS);
  }

  getAllVehicleVinNos(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_VEHICLE_VIN_NOS);
  }

  getAllCustomersCount(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_CUSTOMERS_COUNT); // Update with your actual endpoint constant
  }

  getAllJobCardStatus(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_JOB_CARD_STATUS);
  }

  getRecentJobCards(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_RECENT_JOB_CARDS);
  }

  getRecentInvoices(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_RECENT_INVOICES);
  }

  getTopLaborActivities(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_TOP_LABOR_ACTIVITIES);
  }

  getInvoicesCount(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_INVOICES_COUNT);
  }

  getJobCardsCount(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_JOB_CARDS_COUNT);
  }

  getRevenue(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_REVENUE);
  }

  getRevenueChartData(filter: string): Observable<any> {
    // Invoke it correctly as a function passing the filter parameter
    return this.http.get<any>(API_ENDPOINTS.GET_REVENUE_CHART(filter));
  }

  searchUsers(
    formValues: any,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
  ): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.SEARCH_USERS(page, size, sortBy, sortDir), formValues);
  }
  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_USER_BY_ID(userId));
  }

  saveUser(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.post<any>(API_ENDPOINTS.SAVE_USER, backendPayload);
  }

  getRoles(): Observable<RoleNameDTO[]> {
    return this.http.get<RoleNameDTO[]>(API_ENDPOINTS.GET_ROLE_NAMES);
  }

  modifyUser(backendPayload: any): Observable<any> {
    // Return standard JSON response object containing code, response, and data
    return this.http.put<any>(API_ENDPOINTS.MODIFY_USER, backendPayload);
  }

  getAllItemsNames(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_ITEMS_NAMES);
  }

  getAllUserNames(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_USER_NAMES);
  }

  getAllUserRoles(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_USER_ROLES);
  }

  getAllCustomerNameEmailIds(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_CUSTOMER_NAME_EMAIL_IDS);
  }

  getAllTechnicianIdNames(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GET_ALL_TECHNICIAN_NAMES);
  }

}
