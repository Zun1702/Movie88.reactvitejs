import { combineReducers } from 'redux';
import authReducer from './auth/authReducer.jsx';
import bookingsReducer from './staff/bookingsReducer.jsx';
import dashboardReducer from './admin/dashboardReducer.jsx';

const rootReducer = combineReducers({
  auth: authReducer,
  bookings: bookingsReducer,
  adminDashboard: dashboardReducer,
});

export default rootReducer;
