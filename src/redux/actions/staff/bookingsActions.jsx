import * as types from './bookingsActionTypes.jsx';

// Fetch Bookings Actions
export const fetchBookingsRequest = () => ({
  type: types.FETCH_BOOKINGS_REQUEST,
});

export const fetchBookingsSuccess = (data) => ({
  type: types.FETCH_BOOKINGS_SUCCESS,
  payload: data,
});

export const fetchBookingsFailure = (error) => ({
  type: types.FETCH_BOOKINGS_FAILURE,
  payload: error,
});

// Check-in Booking Actions
export const checkInBookingRequest = () => ({
  type: types.CHECK_IN_BOOKING_REQUEST,
});

export const checkInBookingSuccess = (bookingCode) => ({
  type: types.CHECK_IN_BOOKING_SUCCESS,
  payload: bookingCode,
});

export const checkInBookingFailure = (error) => ({
  type: types.CHECK_IN_BOOKING_FAILURE,
  payload: error,
});

// Verify Booking Actions
export const verifyBookingRequest = () => ({
  type: types.VERIFY_BOOKING_REQUEST,
});

export const verifyBookingSuccess = (bookingData) => ({
  type: types.VERIFY_BOOKING_SUCCESS,
  payload: bookingData,
});

export const verifyBookingFailure = (error) => ({
  type: types.VERIFY_BOOKING_FAILURE,
  payload: error,
});

// Clear Error
export const clearBookingsError = () => ({
  type: types.CLEAR_BOOKINGS_ERROR,
});

// Clear Verified Booking
export const clearVerifiedBooking = () => ({
  type: types.CLEAR_VERIFIED_BOOKING,
});
