import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingsThunk, checkInBookingThunk, verifyBookingThunk, clearVerifiedBooking } from '../redux/thunks/staff/bookingsThunks.jsx';
import Sidebar from '../components/Sidebar';
import { formatToVietnamTime, getCurrentVietnamTime } from '../utils/dateUtils';
import '../style/StaffDashboard.css';

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { bookings, pagination, loading, error, verifiedBooking } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Fetch bookings when component mounts or page changes
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [currentPage, pageSize, activeTab]);

  // Clear verified booking when switching tabs
  useEffect(() => {
    if (activeTab === 'bookings') {
      dispatch(clearVerifiedBooking());
      setBookingCode('');
      setBookingId('');
    }
  }, [activeTab, dispatch]);

  const fetchBookings = async () => {
    const params = {
      cinemaId: user?.cinemaId, // Lấy từ user nếu có
      page: currentPage,
      pageSize: pageSize,
      hasPayment: true, // Chỉ lấy booking đã thanh toán
    };
    await dispatch(fetchBookingsThunk(params));
  };

  const handleCheckIn = async (bookingId, notes = '') => {
    const confirmed = window.confirm('Xác nhận check-in booking này?');
    if (!confirmed) return;

    const checkInData = {
      checkInTime: getCurrentVietnamTime(),
      notes
    };
    const result = await dispatch(checkInBookingThunk(bookingId, checkInData));
    if (result.success) {
      alert(`✅ ${result.message || 'Check-in thành công!'}`);
      
      // Refresh data
      if (activeTab === 'bookings') {
        fetchBookings();
      } else if (activeTab === 'verify' && verifiedBooking) {
        // Re-verify để cập nhật thông tin mới
        await dispatch(verifyBookingThunk(verifiedBooking.bookingCode));
      }
    } else {
      alert(`❌ ${result.error || 'Check-in thất bại!'}`);
    }
  };

  const handleCheckInById = async () => {
    if (!bookingId.trim()) {
      alert('Vui lòng nhập Booking ID');
      return;
    }

    const confirmed = window.confirm(`Xác nhận check-in Booking ID: ${bookingId}?`);
    if (!confirmed) return;

    setCheckInLoading(true);
    const checkInData = {
      checkInTime: getCurrentVietnamTime(),
      notes: ''
    };
    const result = await dispatch(checkInBookingThunk(bookingId.trim(), checkInData));
    setCheckInLoading(false);

    if (result.success) {
      alert(`✅ ${result.message || 'Check-in thành công!'}`);
      setBookingId(''); // Clear input after success
    } else {
      alert(`❌ ${result.error || 'Check-in thất bại!'}`);
    }
  };

  const handleVerifyCode = async () => {
    if (!bookingCode.trim()) {
      alert('Vui lòng nhập mã booking');
      return;
    }
    setVerifyLoading(true);
    const result = await dispatch(verifyBookingThunk(bookingCode.trim()));
    setVerifyLoading(false);
    
    if (!result.success) {
      alert(`❌ ${result.error || 'Booking không hợp lệ!'}`);
    } else {
      console.log('Verified Booking Data:', result.data);
      console.log('Booking ID:', result.data?.bookingId || result.data?.id);
    }
    // If success, verifiedBooking will be updated in Redux store and displayed in UI
  };

  const handleScanQR = () => {
    alert('Mở camera để scan QR code...');
    // TODO: Implement QR scanner
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // Filter bookings by search query (client-side filtering)
  const filteredBookings = (bookings || []).filter(booking =>
    booking.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalBookings = pagination?.totalRecords || 0;
  const checkedInCount = (bookings || []).filter(b => b.canCheckIn).length;
  const pendingCount = (bookings || []).filter(b => !b.canCheckIn).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon blue">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="stat-label">Total Bookings</p>
                <h3 className="stat-value">{loading ? '...' : totalBookings}</h3>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon green">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="stat-label">Checked In</p>
                <h3 className="stat-value">{loading ? '...' : checkedInCount}</h3>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon orange">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="stat-label">Pending Check-in</p>
                <h3 className="stat-value">{loading ? '...' : pendingCount}</h3>
              </div>
            </div>

            <div className="search-section">
              <div className="search-box">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by booking code, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Booking Code</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Showtime</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '1.25rem', color: '#64748b' }}>Loading...</div>
                      </td>
                    </tr>
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.bookingCode}>
                        <td><strong>{booking.bookingCode}</strong></td>
                        <td>
                          <div>{booking.customerName}</div>
                        </td>
                        <td>{booking.movieTitle}</td>
                        <td>{booking.showtimeStart}</td>
                        <td>-</td>
                        <td><strong>{booking.paymentStatus === 'Completed' ? 'Paid' : booking.paymentStatus}</strong></td>
                        <td>
                          <span className={`status-badge ${booking.canCheckIn ? 'checked-in' : 'paid'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn check-in-btn"
                            onClick={() => handleCheckIn(booking.bookingId || booking.id, '')}
                            disabled={booking.canCheckIn || loading}
                          >
                            {booking.canCheckIn ? 'Checked' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state">
                          <div className="empty-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <h3 className="empty-title">No bookings found</h3>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="pagination-info">
                  <span className="page-numbers">
                    Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <span className="total-records">
                    ({pagination.totalRecords} total bookings)
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || loading}
                >
                  Next
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        );

      case 'checkin':
        return (
          <div className="checkin-container">
            <div className="checkin-input-section">
              <div className="scanner-box-small">
                <div className="scanner-icon-small" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="scanner-title-small">Check-In Customer</h2>
                <p className="scanner-text-small">
                  Enter booking ID or scan QR to check-in customer
                </p>
              </div>

              <div className="checkin-input-box">
                <div className="code-input-group-verify">
                  <input
                    type="text"
                    className="code-input-verify"
                    placeholder="Enter Booking ID (e.g., 8)"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    disabled={checkInLoading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && bookingId.trim() && !checkInLoading) {
                        handleCheckInById();
                      }
                    }}
                  />
                  <button 
                    className="verify-btn-main"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                    onClick={handleCheckInById}
                    disabled={checkInLoading || !bookingId.trim()}
                  >
                    {checkInLoading ? (
                      <>
                        <svg className="spinner" fill="none" viewBox="0 0 24 24" width="20" height="20">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking In...
                      </>
                    ) : (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check-In Now
                      </>
                    )}
                  </button>
                  <button className="scan-btn-small" onClick={handleScanQR} disabled={checkInLoading}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR
                  </button>
                </div>
                
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                    💡 <strong>Tip:</strong> You can find the Booking ID in the "Booking List" tab or from the customer's booking details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="verify-container">
            <div className="verify-input-section">
              <div className="scanner-box-small">
                <div className="scanner-icon-small">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="scanner-title-small">Verify Booking Code</h2>
                <p className="scanner-text-small">
                  Enter booking code or scan QR to check booking details
                </p>
              </div>

              <div className="verify-input-box">
                <div className="code-input-group-verify">
                  <input
                    type="text"
                    className="code-input-verify"
                    placeholder="BK2025110..."
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                    maxLength={20}
                    disabled={verifyLoading}
                  />
                  <button 
                    className="verify-btn-main" 
                    onClick={handleVerifyCode}
                    disabled={verifyLoading || !bookingCode.trim()}
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button className="scan-btn-small" onClick={handleScanQR} disabled={verifyLoading}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Details Display */}
            {verifiedBooking && (
              <div className="booking-details-card">
                <div className="booking-details-header">
                  <h3>✅ Booking Verified</h3>
                  <span className={`status-badge-large ${verifiedBooking.canCheckIn ? 'checked-in' : verifiedBooking.status === 'pending' ? 'pending' : 'paid'}`}>
                    {verifiedBooking.status}
                  </span>
                </div>

                <div className="booking-details-body">
                  {/* Booking Info */}
                  <div className="detail-section">
                    <h4 className="detail-section-title">Booking Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Booking Code:</span>
                        <span className="detail-value"><strong>{verifiedBooking.bookingCode}</strong></span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Booking Date:</span>
                        <span className="detail-value">{formatToVietnamTime(verifiedBooking.bookingDate)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{verifiedBooking.bookingStatus}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Can Check-In:</span>
                        <span className="detail-value">{verifiedBooking.canCheckIn ? '✅ Yes' : '❌ No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  {verifiedBooking.movie && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Movie Details</h4>
                      <div className="movie-info-flex">
                        {verifiedBooking.movie.posterUrl && (
                          <img 
                            src={verifiedBooking.movie.posterUrl} 
                            alt={verifiedBooking.movie.title}
                            className="movie-poster-small"
                          />
                        )}
                        <div className="movie-info-text">
                          <div className="detail-item">
                            <span className="detail-label">Title:</span>
                            <span className="detail-value"><strong>{verifiedBooking.movie.title}</strong></span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{verifiedBooking.movie.durationMinutes} minutes</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Rating:</span>
                            <span className="detail-value">{verifiedBooking.movie.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Showtime & Cinema */}
                  {verifiedBooking.showtime && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Showtime & Location</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Start Time:</span>
                          <span className="detail-value">{formatToVietnamTime(verifiedBooking.showtime.startTime)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">End Time:</span>
                          <span className="detail-value">{formatToVietnamTime(verifiedBooking.showtime.endTime)}</span>
                        </div>
                        {verifiedBooking.showtime.cinema && (
                          <>
                            <div className="detail-item">
                              <span className="detail-label">Cinema:</span>
                              <span className="detail-value">{verifiedBooking.showtime.cinema.name}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Address:</span>
                              <span className="detail-value">{verifiedBooking.showtime.cinema.address}</span>
                            </div>
                          </>
                        )}
                        {verifiedBooking.showtime.auditorium && (
                          <>
                            <div className="detail-item">
                              <span className="detail-label">Auditorium:</span>
                              <span className="detail-value">{verifiedBooking.showtime.auditorium.name}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Total Seats:</span>
                              <span className="detail-value">{verifiedBooking.showtime.auditorium.totalSeats}</span>
                            </div>
                          </>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">Format:</span>
                          <span className="detail-value">{verifiedBooking.showtime.format}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Language:</span>
                          <span className="detail-value">{verifiedBooking.showtime.language}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  {verifiedBooking.pricing && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Pricing</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Ticket Price:</span>
                          <span className="detail-value">{verifiedBooking.pricing.ticketPrice?.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Number of Tickets:</span>
                          <span className="detail-value">{verifiedBooking.pricing.numberOfTickets}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Subtotal:</span>
                          <span className="detail-value">{verifiedBooking.pricing.subtotal?.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Discount:</span>
                          <span className="detail-value">{verifiedBooking.pricing.discount?.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="detail-item total-amount">
                          <span className="detail-label">Total Amount:</span>
                          <span className="detail-value"><strong>{verifiedBooking.pricing.totalAmount?.toLocaleString('vi-VN')} VNĐ</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment */}
                  {verifiedBooking.payment && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Payment Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className={`detail-value ${verifiedBooking.payment.status === 'pending' ? 'text-orange' : 'text-green'}`}>
                            <strong>{verifiedBooking.payment.status}</strong>
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Method:</span>
                          <span className="detail-value">{verifiedBooking.payment.paymentMethod || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Transaction Code:</span>
                          <span className="detail-value">{verifiedBooking.payment.transactionCode || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Paid At:</span>
                          <span className="detail-value">{formatToVietnamTime(verifiedBooking.payment.paidAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Check-in Info */}
                  {verifiedBooking.checkIn && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Check-In Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Is Checked In:</span>
                          <span className="detail-value">{verifiedBooking.checkIn.isCheckedIn ? '✅ Yes' : '❌ No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Checked In Time:</span>
                          <span className="detail-value">{formatToVietnamTime(verifiedBooking.checkIn.checkedInTime)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Checked By:</span>
                          <span className="detail-value">{verifiedBooking.checkIn.checkedInBy || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Staff Name:</span>
                          <span className="detail-value">{verifiedBooking.checkIn.checkedInByStaffName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!verifiedBooking.checkIn?.isCheckedIn && verifiedBooking.canCheckIn && (
                  <div className="booking-details-footer">
                    <button 
                      className="check-in-btn-large"
                      onClick={() => handleCheckIn(verifiedBooking.bookingId || verifiedBooking.id, '')}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check In This Booking
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'bookings':
        return { title: 'Booking List', desc: 'View and manage all paid bookings' };
      case 'checkin':
        return { title: 'Check-In', desc: 'Scan QR code or enter booking code to check-in customers' };
      case 'verify':
        return { title: 'Verify Booking', desc: 'Verify booking code and view booking details' };
      default:
        return { title: '', desc: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="staff-dashboard">
      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1 className="page-title">{pageInfo.title}</h1>
          <p className="page-description">{pageInfo.desc}</p>
        </div>

        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
