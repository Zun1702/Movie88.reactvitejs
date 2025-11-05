import * as types from './authActionTypes.jsx';

// Login Actions
export const loginRequest = () => ({
  type: types.LOGIN_REQUEST,
});

export const loginSuccess = (user) => ({
  type: types.LOGIN_SUCCESS,
  payload: user,
});

export const loginFailure = (error) => ({
  type: types.LOGIN_FAILURE,
  payload: error,
});

// Logout Actions
export const logoutRequest = () => ({
  type: types.LOGOUT_REQUEST,
});

export const logoutSuccess = () => ({
  type: types.LOGOUT_SUCCESS,
});

export const logoutFailure = (error) => ({
  type: types.LOGOUT_FAILURE,
  payload: error,
});

// Set User
export const setUser = (user) => ({
  type: types.SET_USER,
  payload: user,
});

// Clear Auth
export const clearAuth = () => ({
  type: types.CLEAR_AUTH,
});

// Clear Error
export const clearError = () => ({
  type: types.CLEAR_ERROR,
});
