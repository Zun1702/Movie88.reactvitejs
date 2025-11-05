import * as types from '../../actions/auth/authActionTypes.jsx';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case types.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case types.LOGOUT_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case types.LOGOUT_SUCCESS:
      return {
        ...initialState,
      };

    case types.LOGOUT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case types.CLEAR_AUTH:
      return {
        ...initialState,
      };

    case types.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;
