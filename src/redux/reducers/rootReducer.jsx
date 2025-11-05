import { combineReducers } from 'redux';
import authReducer from './auth/authReducer.jsx';
import bookingsReducer from './staff/bookingsReducer.jsx';

const rootReducer = combineReducers({
  auth: authReducer,
  bookings: bookingsReducer,
});

export default rootReducer;
