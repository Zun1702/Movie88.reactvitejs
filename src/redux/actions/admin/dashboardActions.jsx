import * as types from './dashboardActionTypes.jsx';

// Fetch Admin Stats Actions
export const fetchAdminStatsRequest = () => ({
  type: types.FETCH_ADMIN_STATS_REQUEST,
});

export const fetchAdminStatsSuccess = (data) => ({
  type: types.FETCH_ADMIN_STATS_SUCCESS,
  payload: data,
});

export const fetchAdminStatsFailure = (error) => ({
  type: types.FETCH_ADMIN_STATS_FAILURE,
  payload: error,
});

// Booking Statistics Actions
export const fetchBookingStatsRequest = () => ({
  type: types.FETCH_BOOKING_STATS_REQUEST,
});

export const fetchBookingStatsSuccess = (data) => ({
  type: types.FETCH_BOOKING_STATS_SUCCESS,
  payload: data,
});

export const fetchBookingStatsFailure = (error) => ({
  type: types.FETCH_BOOKING_STATS_FAILURE,
  payload: error,
});

// Customer Analytics Actions
export const fetchCustomerAnalyticsRequest = () => ({
  type: types.FETCH_CUSTOMER_ANALYTICS_REQUEST,
});

export const fetchCustomerAnalyticsSuccess = (data) => ({
  type: types.FETCH_CUSTOMER_ANALYTICS_SUCCESS,
  payload: data,
});

export const fetchCustomerAnalyticsFailure = (error) => ({
  type: types.FETCH_CUSTOMER_ANALYTICS_FAILURE,
  payload: error,
});

// Revenue Report Actions
export const fetchRevenueReportRequest = () => ({
  type: types.FETCH_REVENUE_REPORT_REQUEST,
});

export const fetchRevenueReportSuccess = (data) => ({
  type: types.FETCH_REVENUE_REPORT_SUCCESS,
  payload: data,
});

export const fetchRevenueReportFailure = (error) => ({
  type: types.FETCH_REVENUE_REPORT_FAILURE,
  payload: error,
});

// Fetch Users Actions
export const fetchUsersRequest = () => ({
  type: types.FETCH_USERS_REQUEST,
});

export const fetchUsersSuccess = (data) => ({
  type: types.FETCH_USERS_SUCCESS,
  payload: data,
});

export const fetchUsersFailure = (error) => ({
  type: types.FETCH_USERS_FAILURE,
  payload: error,
});

// Create User Actions
export const createUserRequest = () => ({
  type: types.CREATE_USER_REQUEST,
});

export const createUserSuccess = (data) => ({
  type: types.CREATE_USER_SUCCESS,
  payload: data,
});

export const createUserFailure = (error) => ({
  type: types.CREATE_USER_FAILURE,
  payload: error,
});

// Update User Role Actions
export const updateUserRoleRequest = () => ({
  type: types.UPDATE_USER_ROLE_REQUEST,
});

export const updateUserRoleSuccess = (data) => ({
  type: types.UPDATE_USER_ROLE_SUCCESS,
  payload: data,
});

export const updateUserRoleFailure = (error) => ({
  type: types.UPDATE_USER_ROLE_FAILURE,
  payload: error,
});

// Toggle User Status Actions
export const toggleUserStatusRequest = () => ({
  type: types.TOGGLE_USER_STATUS_REQUEST,
});

export const toggleUserStatusSuccess = (data) => ({
  type: types.TOGGLE_USER_STATUS_SUCCESS,
  payload: data,
});

export const toggleUserStatusFailure = (error) => ({
  type: types.TOGGLE_USER_STATUS_FAILURE,
  payload: error,
});

// Clear Error
export const clearAdminStatsError = () => ({
  type: types.CLEAR_ADMIN_STATS_ERROR,
});
