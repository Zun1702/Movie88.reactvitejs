import axiosInstance from '../../utils/axiosCustomize.jsx';

// Fetch Admin Dashboard Stats
export const getAdminStats = async () => {
  const response = await axiosInstance.get('/admin/dashboard/stats');
  return response.data;
};

// Fetch Booking Statistics
export const getBookingStats = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('StartDate', startDate);
  if (endDate) params.append('EndDate', endDate);
  
  const response = await axiosInstance.get(`/admin/reports/bookings/statistics?${params.toString()}`);
  return response.data;
};

// Fetch Customer Analytics
export const getCustomerAnalytics = async (period = 'month', topCustomersLimit = 5) => {
  const params = new URLSearchParams();
  if (period) params.append('Period', period);
  if (topCustomersLimit) params.append('TopCustomersLimit', topCustomersLimit);
  
  const response = await axiosInstance.get(`/admin/reports/customers/analytics?${params.toString()}`);
  return response.data;
};

// Fetch Revenue Report (Daily or Monthly)
export const getRevenueReport = async (reportType = 'daily', date = null, month = null, year = null) => {
  const params = new URLSearchParams();
  
  if (reportType === 'daily' && date) {
    params.append('Date', date);
    const response = await axiosInstance.get(`/admin/reports/revenue/daily?${params.toString()}`);
    return response.data;
  } else if (reportType === 'monthly' && month && year) {
    params.append('Month', month);
    params.append('Year', year);
    const response = await axiosInstance.get(`/admin/reports/revenue/monthly?${params.toString()}`);
    return response.data;
  }
  
  throw new Error('Invalid report type or missing parameters');
};

// Fetch Users
export const getUsers = async (role = null, status = null, search = null, page = 1, pageSize = 10) => {
  const params = new URLSearchParams();
  if (role) params.append('Role', role);
  if (status) params.append('Status', status);
  if (search) params.append('Search', search);
  params.append('Page', page);
  params.append('PageSize', pageSize);
  
  const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
  return response.data;
};

// Create New User
export const createUser = async (userData) => {
  const response = await axiosInstance.post('/admin/users', userData);
  return response.data;
};

// Get User Detail
export const getUserDetail = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
};

// Update User Role
export const updateUserRole = async (userId, newRole) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/role`, { newRole });
  return response.data;
};

// Ban/Unban User (Toggle Active Status)
export const toggleUserStatus = async (userId, isActive) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/ban`, { isActive });
  return response.data;
};

const dashboardApiService = {
  getAdminStats,
  getBookingStats,
  getCustomerAnalytics,
  getRevenueReport,
  getUsers,
  createUser,
  getUserDetail,
  updateUserRole,
  toggleUserStatus,
};

export default dashboardApiService;
