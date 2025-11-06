import bookingsApiService from '../../apiService/staff/bookingsApiService.jsx';
import * as bookingsActions from '../../actions/staff/bookingsActions.jsx';

// Fetch Bookings Thunk
export const fetchBookingsThunk = (params = {}) => async (dispatch) => {
  dispatch(bookingsActions.fetchBookingsRequest());

  try {
    console.log('🔍 Fetching bookings with params:', params);
    const response = await bookingsApiService.getBookings(params);
    console.log('📦 API Response:', response);
    console.log('📦 Response structure check - items:', response.items);
    console.log('📦 Response structure check - data:', response.data);

    // Axios interceptor đã return response.data, nên response IS data
    // Kiểm tra xem items có trực tiếp trong response không
    if (response && (response.items || response.data?.items)) {
      // API trả về items - có thể ở response.items hoặc response.data.items
      const dataObject = response.items ? response : response.data;
      const bookings = dataObject.items || [];
      const pagination = {
        currentPage: dataObject.currentPage,
        pageSize: dataObject.pageSize,
        totalPages: dataObject.totalPages,
        totalRecords: dataObject.totalItems,
      };
      
      console.log('✅ Bookings data:', bookings);
      console.log('📊 Pagination:', pagination);
      
      dispatch(bookingsActions.fetchBookingsSuccess({
        bookings,
        pagination,
      }));
      return { success: true, data: { bookings, pagination } };
    } else {
      throw new Error(response.message || 'Failed to fetch bookings - Invalid response structure');
    }
  } catch (error) {
    console.error('❌ Fetch bookings error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bookings';
    dispatch(bookingsActions.fetchBookingsFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Check-in Booking Thunk
export const checkInBookingThunk = (bookingId, checkInData = {}) => async (dispatch) => {
  dispatch(bookingsActions.checkInBookingRequest());

  try {
    const payload = {
      checkInTime: checkInData.checkInTime || new Date().toISOString(),
      notes: checkInData.notes || ''
    };

    const response = await bookingsApiService.checkInBooking(bookingId, payload);
    
    console.log('Check-in Response:', response);

    if (response && response.success) {
      dispatch(bookingsActions.checkInBookingSuccess(bookingId));
      return { success: true, message: response.message, data: response.data };
    } else {
      const errorMsg = response?.message || 'Check-in failed';
      console.error('Check-in failed:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Check-in Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Check-in failed';
    dispatch(bookingsActions.checkInBookingFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Verify Booking Thunk
export const verifyBookingThunk = (bookingCode) => async (dispatch) => {
  dispatch(bookingsActions.verifyBookingRequest());

  try {
    const response = await bookingsApiService.verifyBooking(bookingCode);
    
    console.log('Verify Booking Response:', response);

    if (response && response.success) {
      dispatch(bookingsActions.verifyBookingSuccess(response.data));
      return { success: true, data: response.data };
    } else {
      const errorMsg = response?.message || 'Verification failed';
      console.error('Verify failed:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Verify Booking Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
    dispatch(bookingsActions.verifyBookingFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Clear Bookings Error
export const clearBookingsError = () => (dispatch) => {
  dispatch(bookingsActions.clearBookingsError());
};

// Clear Verified Booking
export const clearVerifiedBooking = () => (dispatch) => {
  dispatch(bookingsActions.clearVerifiedBooking());
};
