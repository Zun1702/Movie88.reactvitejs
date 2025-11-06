import authApiService from '../../apiService/auth/authApiService.jsx';
import * as authActions from '../../actions/auth/authActions.jsx';

// Login Thunk
export const loginThunk = (credentials) => async (dispatch) => {
  dispatch(authActions.loginRequest());

  try {
    const response = await authApiService.login(credentials);

    // Kiểm tra response structure từ backend
    const { token, refreshToken, user } = response;

    // Kiểm tra role của user
    if (!user || !user.roleName) {
      throw new Error('User role not found');
    }

    // Validate role
    if (user.roleName !== 'Staff' && user.roleName !== 'Admin') {
      throw new Error('Invalid role for this portal');
    }

    // Lưu token vào localStorage
    localStorage.setItem('accessToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Dispatch success action
    dispatch(authActions.loginSuccess({ user, token }));

    return { success: true, user };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    dispatch(authActions.loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Logout Thunk
export const logoutThunk = (navigate) => async (dispatch) => {
  dispatch(authActions.logoutRequest());

  try {
    // Call logout API (optional)
    await authApiService.logout();

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    // Dispatch success action
    dispatch(authActions.logoutSuccess());

    // Redirect to login
    if (navigate) {
      navigate('/admin/login');
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
    dispatch(authActions.logoutFailure(errorMessage));

    // Even if API fails, clear local data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    dispatch(authActions.clearAuth());

    if (navigate) {
      navigate('/admin/login');
    }

    return { success: false, error: errorMessage };
  }
};

// Load user from localStorage
export const loadUserFromStorage = () => (dispatch) => {
  try {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      dispatch(authActions.loginSuccess({ user, token }));
      return { success: true, user };
    }
    return { success: false };
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return { success: false };
  }
};

// Clear auth error
export const clearAuthError = () => (dispatch) => {
  dispatch(authActions.clearError());
};
