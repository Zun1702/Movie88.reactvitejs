import dashboardApiService from '../../apiService/admin/dashboardApiService.jsx';
import * as dashboardActions from '../../actions/admin/dashboardActions.jsx';

// Fetch Admin Stats Thunk
export const fetchAdminStatsThunk = () => async (dispatch) => {
  dispatch(dashboardActions.fetchAdminStatsRequest());

  try {
    const response = await dashboardApiService.getAdminStats();
    
    console.log('📊 Admin Stats API Response:', response);

    // Axios interceptor đã return response.data, kiểm tra xem data có trực tiếp trong response không
    if (response && (response.data || response.todayRevenue !== undefined)) {
      const data = response.data || response;
      dispatch(dashboardActions.fetchAdminStatsSuccess(data));
      return { success: true, data };
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch admin stats error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch admin stats';
    dispatch(dashboardActions.fetchAdminStatsFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch Booking Statistics Thunk
export const fetchBookingStatsThunk = (startDate, endDate) => async (dispatch) => {
  dispatch(dashboardActions.fetchBookingStatsRequest());

  try {
    const response = await dashboardApiService.getBookingStats(startDate, endDate);
    
    console.log('📈 Booking Stats API Response:', response);

    if (response && (response.data || response.totalBookings !== undefined)) {
      const data = response.data || response;
      dispatch(dashboardActions.fetchBookingStatsSuccess(data));
      return { success: true, data };
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch booking stats error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch booking stats';
    dispatch(dashboardActions.fetchBookingStatsFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch Customer Analytics Thunk
export const fetchCustomerAnalyticsThunk = (period = 'month', topCustomersLimit = 5) => async (dispatch) => {
  dispatch(dashboardActions.fetchCustomerAnalyticsRequest());

  try {
    const response = await dashboardApiService.getCustomerAnalytics(period, topCustomersLimit);
    
    console.log('👥 Customer Analytics API Response:', response);

    if (response && (response.data || response.totalCustomers !== undefined)) {
      const data = response.data || response;
      dispatch(dashboardActions.fetchCustomerAnalyticsSuccess(data));
      return { success: true, data };
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch customer analytics error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customer analytics';
    dispatch(dashboardActions.fetchCustomerAnalyticsFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch Revenue Report Thunk
export const fetchRevenueReportThunk = (reportType = 'daily', date = null, month = null, year = null) => async (dispatch) => {
  dispatch(dashboardActions.fetchRevenueReportRequest());

  try {
    const response = await dashboardApiService.getRevenueReport(reportType, date, month, year);
    
    console.log('💰 Revenue Report API Response:', response);

    if (response && (response.data || response.totalRevenue !== undefined)) {
      const data = response.data || response;
      dispatch(dashboardActions.fetchRevenueReportSuccess(data));
      return { success: true, data };
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch revenue report error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch revenue report';
    dispatch(dashboardActions.fetchRevenueReportFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch Users Thunk
export const fetchUsersThunk = (role = null, status = null, search = null, page = 1, pageSize = 10) => async (dispatch) => {
  dispatch(dashboardActions.fetchUsersRequest());

  try {
    const response = await dashboardApiService.getUsers(role, status, search, page, pageSize);
    
    console.log('👥 Users API Response:', response);
    console.log('👥 First user item:', response?.items?.[0]);
    console.log('👥 First user has phone?:', response?.items?.[0]?.phone);

    if (response && (response.data || response.items !== undefined)) {
      const data = response.data || response;
      dispatch(dashboardActions.fetchUsersSuccess(data));
      return { success: true, data };
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch users error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
    dispatch(dashboardActions.fetchUsersFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Create User Thunk
export const createUserThunk = (userData) => async (dispatch) => {
  dispatch(dashboardActions.createUserRequest());

  try {
    const response = await dashboardApiService.createUser(userData);
    
    console.log('✅ Create User API Response:', response);
    console.log('✅ Response type:', typeof response);
    console.log('✅ Response keys:', response ? Object.keys(response) : 'null');

    // Axios interceptor returns response.data, so check both cases
    const data = response?.data || response;
    
    if (data && (data.isSuccess || data.userId)) {
      const userData = data.data || data;
      dispatch(dashboardActions.createUserSuccess(userData));
      return { success: true, data: userData, message: data.message || 'User created successfully' };
    } else {
      const errorMsg = data?.message || 'Failed to create user';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('❌ Error response:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
    dispatch(dashboardActions.createUserFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Update User Role Thunk
export const updateUserRoleThunk = (userId, newRole) => async (dispatch) => {
  dispatch(dashboardActions.updateUserRoleRequest());

  try {
    const response = await dashboardApiService.updateUserRole(userId, newRole);
    
    console.log('✅ Update User Role API Response:', response);

    // Axios interceptor returns response.data, so check both cases
    const data = response?.data || response;
    
    if (data && (data.isSuccess || data.userId)) {
      const userData = data.data || data;
      dispatch(dashboardActions.updateUserRoleSuccess(userData));
      return { success: true, data: userData, message: data.message || 'User role updated successfully' };
    } else {
      const errorMsg = data?.message || 'Failed to update user role';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Update user role error:', error);
    console.error('❌ Error response:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update user role';
    dispatch(dashboardActions.updateUserRoleFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Toggle User Status (Ban/Unban) Thunk
export const toggleUserStatusThunk = (userId, isActive) => async (dispatch) => {
  dispatch(dashboardActions.toggleUserStatusRequest());

  try {
    const response = await dashboardApiService.toggleUserStatus(userId, isActive);
    
    console.log('🚫 Toggle User Status API Response:', response);

    // Axios interceptor returns response.data, so check both cases
    const data = response?.data || response;
    
    if (data && (data.isSuccess || data.userId)) {
      const userData = data.data || data;
      dispatch(dashboardActions.toggleUserStatusSuccess(userData));
      return { success: true, data: userData, message: data.message || 'User status updated successfully' };
    } else {
      const errorMsg = data?.message || 'Failed to update user status';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Toggle user status error:', error);
    console.error('❌ Error response:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update user status';
    dispatch(dashboardActions.toggleUserStatusFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Clear Admin Stats Error
export const clearAdminStatsError = () => (dispatch) => {
  dispatch(dashboardActions.clearAdminStatsError());
};
