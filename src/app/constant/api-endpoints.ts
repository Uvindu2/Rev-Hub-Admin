export const API_BASE_URL = 'http://localhost:8085';

export const API_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/customer`,
  GET_TECHNICIAN_NAMES: `${API_BASE_URL}/technician/get-all-technician-names`,
  GET_LABOR_ACTIVITY_NAMES: `${API_BASE_URL}/laborActivity/get-all-labor-activity-names`,
  GET_ITEM_PASRTS: `${API_BASE_URL}/item/fetch-all-items`,
  GET_BY_LICENSE: (licenseNumber: string) => `${API_BASE_URL}/customer/get-customer-by-driving-license-number/${licenseNumber}`,
  GET_BY_VEHICLE_REG_NUMBER: (vehicleRegNumber: string) => `${API_BASE_URL}/vehicle/get-vehicle-and-customer-by-vehicle-reg-number/${vehicleRegNumber}`,
  GET_ALL_JOB_CARDS: (page: number, size: number, sortBy: string, sortDir: string) =>
    `${API_BASE_URL}/job-card/get-all-job-card?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
  // Maps to your @PostMapping(value = "/save", produces = MediaType.APPLICATION_PDF_VALUE)
  SAVE_JOB_CARD: `${API_BASE_URL}/job-card/save`,
  SAVE_INVOICE: `${API_BASE_URL}/invoice/save`,
  GET_LABOR_ACTIVITIES_BY_JOB_ID: (jobId: number) => `${API_BASE_URL}/laborActivity/get-labor-activity-by-job-Id/${jobId}`
};
