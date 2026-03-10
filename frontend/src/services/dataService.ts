import api from "./api";

// Authentication & Users
export const registerOrgAdmin = async (data: any) => {
  const response = await api.post("/org/register-admin", data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const addStoreManager = async (data: any) => {
  const response = await api.post("/org/add-manager", data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const verifyOtp = async (data: any) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOtp = async (data: any) => {
  const response = await api.post("/auth/resend-otp", data);
  return response.data;
};

export const forgotPassword = async (data: any) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get("/auth/admin-dashboard");
  return response.data;
};

export const getManagerDashboard = async () => {
  const response = await api.get("/auth/manager-dashboard");
  return response.data;
};

// Analytics & Dashboard
export const getStoreSummary = async (storeId: string) => {
  const response = await api.get(`/analytics/store-summary/${storeId}`);
  return response.data;
};

export const getTopProducts = async (storeId: string) => {
  const response = await api.get(`/analytics/top-products/${storeId}`);
  return response.data;
};

export const getLowStock = async (storeId: string) => {
  const response = await api.get(`/analytics/low-stock/${storeId}`);
  return response.data;
};

// Inventory & Products
export const createProduct = async (data: any) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const addStock = async (data: any) => {
  const response = await api.post("/inventory/add-stock", data);
  return response.data;
};

export const updateLowStockThreshold = async (data: any) => {
  const response = await api.patch("/inventory/update-threshold", data);
  return response.data;
};

export const getInventory = async (storeId: string) => {
  const response = await api.get(`/inventory/${storeId}`);
  return response.data;
};

// Store Management
export const createStore = async (data: any) => {
  const response = await api.post("/stores", data);
  return response.data;
};

export const getStores = async () => {
  const response = await api.get("/stores");
  return response.data;
};

// POS Sales
export const recordSale = async (data: any) => {
  const response = await api.post("/sales", data);
  return response.data;
};

// AI & BigQuery
export const getDashboardPredictions = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getReorderRecommendations = async () => {
  const response = await api.get("/reorder");
  return response.data;
};

export const getAlerts = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

export const getTrend = async (seriesId: string) => {
  const response = await api.get(`/trend?series_id=${seriesId}`);
  return response.data;
};

export const runForecast = async () => {
  const response = await api.post("/run-forecast");
  return response.data;
};

export const retrainModel = async () => {
  const response = await api.post("/retrain-model");
  return response.data;
};

// Health
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};
