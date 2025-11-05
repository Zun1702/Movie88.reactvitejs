import * as types from '../../actions/staff/bookingsActionTypes.jsx';

const initialState = {
  bookings: [],
  pagination: null,
  verifiedBooking: null,
  loading: false,
  error: null,
};

const bookingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_BOOKINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_BOOKINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: action.payload.bookings,
        pagination: action.payload.pagination,
        error: null,
      };

    case types.FETCH_BOOKINGS_FAILURE:
      return {
        ...state,
        loading: false,
        bookings: [],
        error: action.payload,
      };

    case types.CHECK_IN_BOOKING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.CHECK_IN_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        bookings: state.bookings.map((booking) =>
          booking.bookingCode === action.payload
            ? { ...booking, canCheckIn: true }
            : booking
        ),
        error: null,
      };

    case types.CHECK_IN_BOOKING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.VERIFY_BOOKING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        verifiedBooking: null,
      };

    case types.VERIFY_BOOKING_SUCCESS:
      return {
        ...state,
        loading: false,
        verifiedBooking: action.payload,
        error: null,
      };

    case types.VERIFY_BOOKING_FAILURE:
      return {
        ...state,
        loading: false,
        verifiedBooking: null,
        error: action.payload,
      };

    case types.CLEAR_BOOKINGS_ERROR:
      return {
        ...state,
        error: null,
      };

    case types.CLEAR_VERIFIED_BOOKING:
      return {
        ...state,
        verifiedBooking: null,
      };

    default:
      return state;
  }
};

export default bookingsReducer;
