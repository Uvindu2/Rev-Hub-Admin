import { environment } from '../../environments/environment';
export const API_BASE_URL = environment.apiUrl;
export const API_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/customer`,
  GET_TECHNICIAN_NAMES: `${API_BASE_URL}/technician/get-all-technician-names`,
  GET_LABOR_ACTIVITY_NAMES: `${API_BASE_URL}/labor-activity/get-all-labor-activity-names`,
  GET_ITEM_PASRTS: `${API_BASE_URL}/item/fetch-all-items`,
  GET_BY_LICENSE: (licenseNumber: string) =>
    `${API_BASE_URL}/customer/get-customer-by-driving-license-number/${licenseNumber}`,
  GET_BY_CONTACT_NUMBER: (contactNumber: string) =>
    `${API_BASE_URL}/customer/get-customer-by-contact-number/${contactNumber}`,
  GET_BY_VEHICLE_REG_NUMBER: (vehicleRegNumber: string) =>
    `${API_BASE_URL}/vehicle/get-vehicle-and-customer-by-vehicle-reg-number/${vehicleRegNumber}`,
  GET_ALL_JOB_CARDS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/job-card/get-all-job-card?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  // Maps to your @PostMapping(value = "/save", produces = MediaType.APPLICATION_PDF_VALUE)
  SAVE_JOB_CARD: `${API_BASE_URL}/job-card/save`,
  MODIFY_JOB_CARD: `${API_BASE_URL}/job-card/modify`,
  SAVE_INVOICE: `${API_BASE_URL}/invoice/save`,
  GET_LABOR_ACTIVITIES_BY_JOB_ID: (jobId: number) =>
    `${API_BASE_URL}/labor-activity/get-labor-activity-by-job-Id/${jobId}`,
  GET_INVOICE_SUMMARIES: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/invoice/get-all-invoice-summary?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_ALL_CUSTOMERS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/customer/get-all-customers-summary?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_ALL_VEHICLE_SUMMARIES: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/vehicle/get-all-vehicles-summary?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_JOB_CARD_BY_ID: (jobId: number) => `${API_BASE_URL}/job-card/get-job-card-by-jobId/${jobId}`,
  GET_ITEM_BY_ID: (itemId: number) => `${API_BASE_URL}/item/get-item-by-itemId/${itemId}`,
  GET_ALL_ITEMS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/item/get-all-items?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_ALL_LABOR_ACTIVITIES: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/labor-activity/get-all-labor-activities?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_LABOR_ACTIVITY_BY_ID: (laborActivityId: number) =>
    `${API_BASE_URL}/labor-activity/get-labor-activity-by-laborActivityId/${laborActivityId}`,
  SAVE_LABOR_ACTIVITY: `${API_BASE_URL}/labor-activity/save`,
  MODIFY_LABOR_ACTIVITY: `${API_BASE_URL}/labor-activity/modify`,
  SAVE_ITEM: `${API_BASE_URL}/item/save`,
  MODIFY_ITEM: `${API_BASE_URL}/item/modify`,
  GET_ALL_TECHNICIANS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/technician/get-all-technicians?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  GET_TECHNICIAN_BY_ID: (id: number) =>
    `${API_BASE_URL}/technician/get-technician-by-technicianId/${id}`,
  SAVE_TECHNICIAN: `${API_BASE_URL}/technician/save`,
  MODIFY_TECHNICIAN: `${API_BASE_URL}/technician/modify`,
  GET_VEHICLE_BY_ID: (vehicleId: number) =>
    `${API_BASE_URL}/vehicle/get-vehicle-by-vehicleId/${vehicleId}`,
  MODIFY_VEHICLE: `${API_BASE_URL}/vehicle/modify`,
  MODIFY_CUSTOMER: `${API_BASE_URL}/customer/modify`,
  GET_CUSTOMER_BY_ID: (customerId: number) =>
    `${API_BASE_URL}/customer/get-customer-by-customerId/${customerId}`,
  VIEW_INVOICE_BY_ID: (invoiceId: number) =>
    `${API_BASE_URL}/invoice/get-invoice-by-invoiceId/${invoiceId}/pdf`,
  GET_BY_VEHICLE_VIN_NUMBER: (vehicleVinNumber: string) =>
    `${API_BASE_URL}/vehicle/get-vehicle-and-customer-by-vehicle-vin-number/${vehicleVinNumber}`,
  SEARCH_JOB_CARDS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/job-card/search?page=${page}&size=${size}&sort=${sortBy},${sortDir}`,
  SEARCH_INVOICES: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/invoice/search?page=${page}&size=${size}&sort=${sortBy},${sortDir}`,
  GET_ALL_VEHICLE_REG_NOS: `${API_BASE_URL}/vehicle/get-all-vehicle-reg-nos`,
  GET_ALL_VEHICLE_VIN_NOS: `${API_BASE_URL}/vehicle/get-all-vehicle-vin-nos`,

  GET_ALL_CUSTOMERS_COUNT: `${API_BASE_URL}/dashboard/get-all-customers-count/`,
  GET_ALL_JOB_CARD_STATUS: `${API_BASE_URL}/dashboard/get-all-job-card-status/`,
  GET_RECENT_JOB_CARDS: `${API_BASE_URL}/dashboard/get-recent-job-cards/`,
  GET_RECENT_INVOICES: `${API_BASE_URL}/dashboard/get-recent-invoices/`,
  GET_TOP_LABOR_ACTIVITIES: `${API_BASE_URL}/dashboard/get-top-labor-activities/`,
  GET_INVOICES_COUNT: `${API_BASE_URL}/dashboard/get-invoices-count/`,
  GET_JOB_CARDS_COUNT: `${API_BASE_URL}/dashboard/get-job-cards-count/`,
  GET_REVENUE: `${API_BASE_URL}/dashboard/get-revenue/`,
  GET_REVENUE_CHART: (filter: string) => `${API_BASE_URL}/dashboard/revenue/chart?filter=${filter}`,
  SEARCH_USERS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/user/search?page=${page}&size=${size}&sort=${sortBy},${sortDir}`,
  GET_USER_BY_ID: (userId: number) => `${API_BASE_URL}/user/get-user-by-userId/${userId}`,
  SAVE_USER: `${API_BASE_URL}/user/save`,
  GET_ROLE_NAMES: `${API_BASE_URL}/role/get-all-role-names`,
  MODIFY_USER: `${API_BASE_URL}/user/modify`,
  GET_ALL_ITEMS_NAMES: `${API_BASE_URL}/item/get-all-item-names`,
  GET_ALL_USER_NAMES: `${API_BASE_URL}/user/get-all-user-names`,
  GET_ALL_USER_ROLES: `${API_BASE_URL}/role/get-all-role-names`,
};
