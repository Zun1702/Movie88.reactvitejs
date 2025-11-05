import axiosInstance from '../../utils/axiosCustomize.jsx';

const authApiService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/Auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axiosInstance.post('/Auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/Auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosInstance.post('/Auth/refresh-token', {
        refreshToken,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authApiService;
