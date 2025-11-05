import axiosInstance from '../../utils/axiosCustomize.jsx';

// Fetch bookings with filters
export const getBookings = async (params = {}) => {
  const { cinemaId, page = 1, pageSize = 10, status, hasPayment } = params;
  
  const queryParams = new URLSearchParams();
  if (cinemaId) queryParams.append('CinemaId', cinemaId);
  queryParams.append('Page', page);
  queryParams.append('PageSize', pageSize);
  if (status) queryParams.append('Status', status);
  if (hasPayment !== undefined) queryParams.append('HasPayment', hasPayment);

  const response = await axiosInstance.get(`/Bookings/today?${queryParams.toString()}`);
  return response.data;
};

// Check-in booking
export const checkInBooking = async (bookingId, checkInData) => {
  console.log('Calling check-in API with:', { bookingId, checkInData });
  const response = await axiosInstance.put(`/Bookings/${bookingId}/check-in`, checkInData);
  console.log('Check-in API Response:', response);
  return response;
};

// Verify booking - Get detailed booking information
export const verifyBooking = async (bookingCode) => {
  console.log('Calling verify API with code:', bookingCode);
  const response = await axiosInstance.get(`/Bookings/verify/${bookingCode}`);
  console.log('API Response:', response);
  return response;
};

const bookingsApiService = {
  getBookings,
  checkInBooking,
  verifyBooking,
};

export default bookingsApiService;
