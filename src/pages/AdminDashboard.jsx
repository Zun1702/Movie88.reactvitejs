import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logoutThunk } from '../redux/thunks/auth/authThunks.jsx';
import { fetchAdminStatsThunk, fetchBookingStatsThunk, fetchCustomerAnalyticsThunk, fetchRevenueReportThunk, fetchUsersThunk, createUserThunk, updateUserRoleThunk, toggleUserStatusThunk } from '../redux/thunks/admin/dashboardThunks.jsx';
import '../style/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, popularMovies, upcomingShowtimes, bookingStats, customerAnalytics, revenueReport, users, loading, bookingStatsLoading, customerAnalyticsLoading, revenueReportLoading, usersLoading, error } = useSelector((state) => state.adminDashboard);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // User Management filters
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add User Form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullname: '',
    role: '',
    phone: '',
  });
  
  // Date range for booking statistics
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // Customer Analytics state
  const [customerPeriod, setCustomerPeriod] = useState('month');
  const [topCustomersLimit, setTopCustomersLimit] = useState(5);

  // Revenue Report state
  const [revenueReportType, setRevenueReportType] = useState('daily');
  const [revenueDate, setRevenueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [revenueMonth, setRevenueMonth] = useState(() => new Date().getMonth() + 1);
  const [revenueYear, setRevenueYear] = useState(() => new Date().getFullYear());

  // Fetch admin stats when component mounts or activeTab changes to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      dispatch(fetchAdminStatsThunk());
      dispatch(fetchBookingStatsThunk(startDate, endDate));
      dispatch(fetchCustomerAnalyticsThunk(customerPeriod, topCustomersLimit));
      
      // Fetch revenue report based on type
      if (revenueReportType === 'daily') {
        dispatch(fetchRevenueReportThunk('daily', revenueDate));
      } else {
        dispatch(fetchRevenueReportThunk('monthly', null, revenueMonth, revenueYear));
      }
    }
    
    if (activeTab === 'users') {
      dispatch(fetchUsersThunk(userRole, userStatus, userSearch, currentPage, pageSize));
    }
  }, [activeTab, dispatch]);

  // Fetch booking stats when date range changes
  const handleFetchBookingStats = () => {
    dispatch(fetchBookingStatsThunk(startDate, endDate));
  };

  // Fetch customer analytics
  const handleFetchCustomerAnalytics = () => {
    dispatch(fetchCustomerAnalyticsThunk(customerPeriod, topCustomersLimit));
  };

  // Fetch revenue report
  const handleFetchRevenueReport = () => {
    if (revenueReportType === 'daily') {
      dispatch(fetchRevenueReportThunk('daily', revenueDate));
    } else {
      dispatch(fetchRevenueReportThunk('monthly', null, revenueMonth, revenueYear));
    }
  };

  // Fetch users with filters
  const handleFetchUsers = () => {
    dispatch(fetchUsersThunk(userRole, userStatus, userSearch, currentPage, pageSize));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(fetchUsersThunk(userRole, userStatus, userSearch, newPage, pageSize));
  };

  const handleLogout = async () => {
    toast.info('Đang đăng xuất...');
    await dispatch(logoutThunk(navigate));
    toast.success('Đã đăng xuất thành công!');
  };

  const handleAddUserChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.email || !newUser.password || !newUser.fullname || !newUser.role) {
      toast.error('Please fill in all required fields!');
      return;
    }

    const result = await dispatch(createUserThunk(newUser));
    
    if (result.success) {
      toast.success(result.message || 'User created successfully!');
      setShowAddUserModal(false);
      // Reset form
      setNewUser({
        email: '',
        password: '',
        fullname: '',
        role: '',
        phone: '',
      });
      // Refresh user list - keep current page and filters
      await dispatch(fetchUsersThunk(userRole, userStatus, userSearch, currentPage, pageSize));
    } else {
      toast.error(result.error || 'Failed to create user!');
    }
  };

  const handleEditUser = (user) => {
    console.log('📝 Edit User - Full user object:', user);
    console.log('📝 User keys:', Object.keys(user));
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUserRole = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedUser.role) {
      toast.error('Please select a role!');
      return;
    }

    const result = await dispatch(updateUserRoleThunk(selectedUser.userId, selectedUser.role));
    
    if (result.success) {
      toast.success(result.message || 'User role updated successfully!');
      setShowEditUserModal(false);
      setSelectedUser(null);
      // Refresh user list - keep current page and filters
      await dispatch(fetchUsersThunk(userRole, userStatus, userSearch, currentPage, pageSize));
    } else {
      toast.error(result.error || 'Failed to update user role!');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'ban' : 'unban';
    const confirmMsg = currentStatus 
      ? 'Are you sure you want to ban this user?' 
      : 'Are you sure you want to unban this user?';
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    const newStatus = !currentStatus; // Toggle the status
    const result = await dispatch(toggleUserStatusThunk(userId, newStatus));
    
    if (result.success) {
      toast.success(result.message || `User ${action}ned successfully!`);
      // Refresh user list - keep current page and filters
      await dispatch(fetchUsersThunk(userRole, userStatus, userSearch, currentPage, pageSize));
    } else {
      toast.error(result.error || `Failed to ${action} user!`);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId);
      toast.info('Delete functionality coming soon!');
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ fontSize: '1.25rem', color: '#64748b' }}>Loading dashboard data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '1.125rem', marginBottom: '1rem' }}>
            ❌ Error loading dashboard data
          </div>
          <div style={{ color: '#64748b' }}>{error}</div>
          <button 
            onClick={() => dispatch(fetchAdminStatsThunk())}
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon revenue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">Today Revenue</p>
              <h3 className="admin-stat-value">{stats.todayRevenue.toLocaleString('vi-VN')} ₫</h3>
              <span className="admin-stat-trend positive">Today's earnings</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon bookings">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">Today Bookings</p>
              <h3 className="admin-stat-value">{stats.todayBookings.toLocaleString()}</h3>
              <span className="admin-stat-trend positive">Today's bookings</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon users">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">Active Customers</p>
              <h3 className="admin-stat-value">{stats.activeCustomers.toLocaleString()}</h3>
              <span className="admin-stat-trend positive">Active users</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon staff">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">Active Movies</p>
              <h3 className="admin-stat-value">{stats.activeMovies}</h3>
              <span className="admin-stat-trend neutral">Currently showing</span>
            </div>
          </div>
        </div>

        {/* Booking Statistics Section */}
        <div className="booking-stats-section">
          <div className="booking-stats-header">
            <div>
              <h3>Booking Analytics</h3>
              <p>Detailed booking statistics and insights</p>
            </div>
            <div className="date-range-selector">
              <div className="date-input-group">
                <label>From:</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label>To:</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <button 
                className="admin-btn primary small" 
                onClick={handleFetchBookingStats}
                disabled={bookingStatsLoading}
              >
                {bookingStatsLoading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>

          <div className="booking-stats-grid">
            {/* Booking Metrics */}
            <div className="booking-stat-card">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Total Bookings</span>
              </div>
              <div className="booking-stat-value">{bookingStats.totalBookings}</div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Checked In</span>
              </div>
              <div className="booking-stat-value green">{bookingStats.checkedInBookings}</div>
              <div className="booking-stat-subtitle">Rate: {bookingStats.checkInRate}</div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Completed</span>
              </div>
              <div className="booking-stat-value blue">{bookingStats.completedBookings}</div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Canceled</span>
              </div>
              <div className="booking-stat-value red">{bookingStats.canceledBookings}</div>
              <div className="booking-stat-subtitle">Rate: {bookingStats.cancellationRate}</div>
            </div>

            <div className="booking-stat-card highlighted">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Avg. Booking Value</span>
              </div>
              <div className="booking-stat-value">{bookingStats.averageBookingValue.toLocaleString('vi-VN')} ₫</div>
            </div>

            <div className="booking-stat-card">
              <div className="booking-stat-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Conversion Rate</span>
              </div>
              <div className="booking-stat-value">{bookingStats.conversionRate}</div>
            </div>
          </div>

          {/* Peak Times */}
          <div className="peak-times-section">
            <div className="peak-time-card">
              <h4>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Peak Hours
              </h4>
              <div className="peak-time-list">
                {bookingStats.peakHours && bookingStats.peakHours.length > 0 ? (
                  bookingStats.peakHours.map((hour, index) => (
                    <div key={index} className="peak-time-item">
                      <span className="peak-time-badge">{hour}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No peak hours data</p>
                )}
              </div>
            </div>

            <div className="peak-time-card">
              <h4>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Peak Days
              </h4>
              <div className="peak-time-list">
                {bookingStats.peakDays && bookingStats.peakDays.length > 0 ? (
                  bookingStats.peakDays.map((day, index) => (
                    <div key={index} className="peak-time-item">
                      <span className="peak-day-badge">{day}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No peak days data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics Section */}
        <div className="customer-analytics-section">
          <div className="customer-analytics-header">
            <div>
              <h3>Customer Analytics</h3>
              <p>Comprehensive customer insights and metrics</p>
            </div>
            <div className="analytics-controls">
              <div className="period-selector">
                <label>Period:</label>
                <select 
                  value={customerPeriod} 
                  onChange={(e) => setCustomerPeriod(e.target.value)}
                  className="period-select"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="limit-selector">
                <label>Top Customers:</label>
                <select 
                  value={topCustomersLimit} 
                  onChange={(e) => setTopCustomersLimit(Number(e.target.value))}
                  className="limit-select"
                >
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="20">Top 20</option>
                </select>
              </div>
              <button 
                className="admin-btn small primary" 
                onClick={handleFetchCustomerAnalytics}
                disabled={customerAnalyticsLoading}
              >
                {customerAnalyticsLoading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Customer Overview Stats */}
          <div className="customer-stats-grid">
            <div className="customer-stat-card">
              <div className="customer-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">Total Customers</p>
                <h4 className="customer-stat-value">{customerAnalytics.totalCustomers}</h4>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon new">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">New Customers</p>
                <h4 className="customer-stat-value green">{customerAnalytics.newCustomers}</h4>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">Active Customers</p>
                <h4 className="customer-stat-value blue">{customerAnalytics.activeCustomers}</h4>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon retention">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">Retention Rate</p>
                <h4 className="customer-stat-value">{customerAnalytics.retentionRate}</h4>
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon churn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">Churn Rate</p>
                <h4 className="customer-stat-value red">{customerAnalytics.churnRate}</h4>
              </div>
            </div>

            <div className="customer-stat-card highlighted">
              <div className="customer-stat-icon lifetime">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="customer-stat-content">
                <p className="customer-stat-label">Avg. Lifetime Value</p>
                <h4 className="customer-stat-value">{(customerAnalytics.averageLifetimeValue / 1000).toFixed(0)}K ₫</h4>
              </div>
            </div>
          </div>

          {/* Top Customers and Demographics */}
          <div className="customer-details-grid">
            {/* Top Customers */}
            <div className="top-customers-card">
              <h4>Top Customers</h4>
              <div className="top-customers-list">
                {customerAnalytics.topCustomers && customerAnalytics.topCustomers.length > 0 ? (
                  customerAnalytics.topCustomers.map((customer, index) => (
                    <div key={customer.customerId} className="top-customer-item">
                      <div className="customer-rank">#{index + 1}</div>
                      <div className="customer-info">
                        <h5>{customer.fullname}</h5>
                        <p>{customer.email}</p>
                        <div className="customer-stats">
                          <span className="customer-bookings">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {customer.totalBookings} bookings
                          </span>
                          <span className="customer-spent">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {(customer.totalSpent / 1000).toFixed(0)}K ₫
                          </span>
                        </div>
                        <div className="customer-since">
                          Member since: {new Date(customer.memberSince).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No top customers data</p>
                )}
              </div>
            </div>

            {/* Demographics */}
            <div className="demographics-card">
              <h4>Demographics</h4>
              
              {/* Age Distribution */}
              <div className="demographics-section">
                <h5>Age Distribution</h5>
                <div className="demographics-bars">
                  {customerAnalytics.demographics.age && Object.keys(customerAnalytics.demographics.age).length > 0 ? (
                    Object.entries(customerAnalytics.demographics.age).map(([ageGroup, percentage]) => (
                      <div key={ageGroup} className="demographic-bar-item">
                        <div className="demographic-label">
                          <span>{ageGroup}</span>
                          <span className="demographic-percentage">{percentage}</span>
                        </div>
                        <div className="demographic-bar">
                          <div 
                            className="demographic-bar-fill age"
                            style={{ width: percentage }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No age data</p>
                  )}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="demographics-section">
                <h5>Gender Distribution</h5>
                <div className="demographics-bars">
                  {customerAnalytics.demographics.gender && Object.keys(customerAnalytics.demographics.gender).length > 0 ? (
                    Object.entries(customerAnalytics.demographics.gender).map(([gender, percentage]) => (
                      <div key={gender} className="demographic-bar-item">
                        <div className="demographic-label">
                          <span className="capitalize">{gender}</span>
                          <span className="demographic-percentage">{percentage}</span>
                        </div>
                        <div className="demographic-bar">
                          <div 
                            className={`demographic-bar-fill gender ${gender}`}
                            style={{ width: percentage }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No gender data</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Report Section */}
        <div className="revenue-report-section">
          <div className="revenue-report-header">
            <div>
              <h3>Revenue Report</h3>
              <p>Detailed revenue breakdown and analysis</p>
            </div>
            <div className="revenue-controls">
              <div className="report-type-selector">
                <label>Report Type:</label>
                <select 
                  value={revenueReportType} 
                  onChange={(e) => setRevenueReportType(e.target.value)}
                  className="report-type-select"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              {revenueReportType === 'daily' ? (
                <div className="date-selector">
                  <label>Date:</label>
                  <input 
                    type="date" 
                    value={revenueDate}
                    onChange={(e) => setRevenueDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              ) : (
                <>
                  <div className="month-selector">
                    <label>Month:</label>
                    <select 
                      value={revenueMonth}
                      onChange={(e) => setRevenueMonth(Number(e.target.value))}
                      className="month-select"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="year-selector">
                    <label>Year:</label>
                    <input 
                      type="number" 
                      value={revenueYear}
                      onChange={(e) => setRevenueYear(Number(e.target.value))}
                      className="year-input"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </>
              )}
              
              <button 
                className="admin-btn small primary" 
                onClick={handleFetchRevenueReport}
                disabled={revenueReportLoading}
              >
                {revenueReportLoading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="revenue-overview-grid">
            <div className="revenue-stat-card primary">
              <div className="revenue-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="revenue-stat-content">
                <p className="revenue-stat-label">Total Revenue</p>
                <h4 className="revenue-stat-value">{(revenueReport.totalRevenue / 1000).toFixed(0)}K ₫</h4>
                <p className="revenue-stat-period">{revenueReport.period}</p>
              </div>
            </div>

            <div className="revenue-stat-card">
              <div className="revenue-stat-icon bookings">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="revenue-stat-content">
                <p className="revenue-stat-label">Total Bookings</p>
                <h4 className="revenue-stat-value">{revenueReport.totalBookings}</h4>
              </div>
            </div>

            <div className="revenue-stat-card">
              <div className="revenue-stat-icon avg">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="revenue-stat-content">
                <p className="revenue-stat-label">Avg Ticket Price</p>
                <h4 className="revenue-stat-value">{(revenueReport.averageTicketPrice / 1000).toFixed(0)}K ₫</h4>
              </div>
            </div>

            <div className="revenue-stat-card breakdown">
              <div className="revenue-stat-icon tickets">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="revenue-stat-content">
                <p className="revenue-stat-label">Ticket Sales</p>
                <h4 className="revenue-stat-value small">{(revenueReport.breakdown.ticketSales / 1000).toFixed(0)}K ₫</h4>
              </div>
            </div>

            <div className="revenue-stat-card breakdown">
              <div className="revenue-stat-icon concessions">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="revenue-stat-content">
                <p className="revenue-stat-label">Concessions</p>
                <h4 className="revenue-stat-value small">{(revenueReport.breakdown.concessions / 1000).toFixed(0)}K ₫</h4>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Tables */}
          <div className="revenue-breakdown-grid">
            {/* By Movie */}
            <div className="revenue-breakdown-card">
              <h4>Revenue by Movie</h4>
              <div className="revenue-breakdown-list">
                {revenueReport.byMovie && revenueReport.byMovie.length > 0 ? (
                  revenueReport.byMovie.map((movie) => (
                    <div key={movie.movieId} className="revenue-breakdown-item">
                      <div className="breakdown-info">
                        <h5>{movie.movieTitle}</h5>
                        <p>{movie.bookings} bookings</p>
                      </div>
                      <div className="breakdown-value">
                        {(movie.revenue / 1000).toFixed(0)}K ₫
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No movie data</p>
                )}
              </div>
            </div>

            {/* By Cinema */}
            <div className="revenue-breakdown-card">
              <h4>Revenue by Cinema</h4>
              <div className="revenue-breakdown-list">
                {revenueReport.byCinema && revenueReport.byCinema.length > 0 ? (
                  revenueReport.byCinema.map((cinema) => (
                    <div key={cinema.cinemaId} className="revenue-breakdown-item">
                      <div className="breakdown-info">
                        <h5>{cinema.cinemaName}</h5>
                        <p>{cinema.bookings} bookings</p>
                      </div>
                      <div className="breakdown-value">
                        {(cinema.revenue / 1000).toFixed(0)}K ₫
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No cinema data</p>
                )}
              </div>
            </div>

            {/* By Hour (Daily only) */}
            {revenueReportType === 'daily' && revenueReport.byHour && revenueReport.byHour.length > 0 && (
              <div className="revenue-breakdown-card">
                <h4>Revenue by Hour</h4>
                <div className="revenue-breakdown-list">
                  {revenueReport.byHour.map((hour, index) => (
                    <div key={index} className="revenue-breakdown-item">
                      <div className="breakdown-info">
                        <h5>{hour.hour}</h5>
                        <p>{hour.bookings} bookings</p>
                      </div>
                      <div className="breakdown-value">
                        {(hour.revenue / 1000).toFixed(0)}K ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="admin-charts-section">
          <div className="admin-chart-card large">
            <div className="admin-chart-header">
              <h3>Popular Movies</h3>
              <p>Top 5 movies by bookings and revenue</p>
            </div>
            <div className="admin-chart-content">
              <div className="popular-movies-grid">
                {popularMovies && popularMovies.length > 0 ? (
                  popularMovies.map((movie, index) => (
                    <div key={movie.movieId} className="popular-movie-card">
                      <div className="popular-movie-rank">#{index + 1}</div>
                      <div className="popular-movie-poster">
                        <img src={movie.posterUrl} alt={movie.title} />
                      </div>
                      <div className="popular-movie-details">
                        <h4>{movie.title}</h4>
                        <div className="popular-movie-stats">
                          <div className="stat-item">
                            <span className="stat-label">Bookings:</span>
                            <span className="stat-value">{movie.totalBookings}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Revenue:</span>
                            <span className="stat-value revenue">{(movie.revenue / 1000).toFixed(0)}K ₫</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No popular movies data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-chart-card">
            <div className="admin-chart-header">
              <h3>Upcoming Showtimes</h3>
              <p>Next showtimes today</p>
            </div>
            <div className="admin-chart-content">
              <div className="showtimes-list">
                {upcomingShowtimes && upcomingShowtimes.length > 0 ? (
                  upcomingShowtimes.slice(0, 8).map((showtime) => (
                    <div key={showtime.showtimeId} className="showtime-item">
                      {showtime.moviePosterUrl && (
                        <img 
                          src={showtime.moviePosterUrl} 
                          alt={showtime.movieTitle}
                          className="showtime-poster"
                        />
                      )}
                      <div className="showtime-time">
                        {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="showtime-info">
                        <h5>{showtime.movieTitle}</h5>
                        <div className="showtime-details">
                          <span>{showtime.cinemaName}</span>
                          <span>•</span>
                          <span>{showtime.auditoriumName}</span>
                        </div>
                        <div className="showtime-meta">
                          <span className="showtime-format">{showtime.format}</span>
                          <span>•</span>
                          <span className="showtime-price">{showtime.price.toLocaleString('vi-VN')} ₫</span>
                          <span>•</span>
                          <span className="showtime-seats">{showtime.availableSeats}/{showtime.totalSeats} seats</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No upcoming showtimes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderUserManagement = () => {
    if (usersLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ fontSize: '1.25rem', color: '#64748b' }}>Loading users...</div>
        </div>
      );
    }

    return (
      <>
        {/* Header with Action Button and Stats */}
        <div className="admin-section-header">
          <div>
            <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0 }}>
              Total {users.totalItems} users - Page {users.currentPage} of {users.totalPages}
            </p>
          </div>
          <button className="admin-btn primary" onClick={() => setShowAddUserModal(true)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="user-filters">
          <div className="filter-group">
            <label>Role:</label>
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="filter-select">
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)} className="filter-select">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group search">
            <label>Search:</label>
            <input 
              type="text" 
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="filter-input"
            />
          </div>
          
          <button className="admin-btn small primary" onClick={handleFetchUsers}>
            Apply Filters
          </button>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.items && users.items.length > 0 ? (
                users.items.map((user) => (
                  <tr key={user.userId}>
                    <td>#{user.userId}</td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.fullname.charAt(0).toUpperCase()}
                        </div>
                        <span className="admin-user-name">{user.fullname}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.registeredAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`admin-status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-buttons">
                        <button 
                          className="admin-action-btn edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className={`admin-action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(user.userId, user.isActive)}
                          title={user.isActive ? 'Ban User' : 'Unban User'}
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            {user.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>
                        <button 
                          className="admin-action-btn delete"
                          onClick={() => handleDeleteUser(user.userId)}
                          title="Delete User"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.totalPages > 1 && (
          <div className="admin-pagination">
            <div className="pagination-info">
              Showing {users.items.length} of {users.totalItems} users
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!users.hasPreviousPage}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="pagination-pages">
                {[...Array(users.totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!users.hasNextPage}
              >
                Next
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="admin-modal-overlay" onClick={() => setShowAddUserModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Add New User</h3>
                <button className="admin-modal-close" onClick={() => setShowAddUserModal(false)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddUserSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Enter full name"
                      value={newUser.fullname}
                      onChange={(e) => handleAddUserChange('fullname', e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      placeholder="Enter email address"
                      value={newUser.email}
                      onChange={(e) => handleAddUserChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      placeholder="Enter password"
                      value={newUser.password}
                      onChange={(e) => handleAddUserChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="Enter phone number"
                      value={newUser.phone}
                      onChange={(e) => handleAddUserChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => handleAddUserChange('role', e.target.value)}
                      required
                    >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={usersLoading}>
                  {usersLoading ? 'Creating...' : 'Add User'}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="admin-modal-overlay" onClick={() => setShowEditUserModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Edit User Role</h3>
                <button className="admin-modal-close" onClick={() => setShowEditUserModal(false)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateUserRole}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label>User ID</label>
                    <input 
                      type="text" 
                      value={selectedUser.userId} 
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={selectedUser.fullname || selectedUser.fullName || 'N/A'} 
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={selectedUser.email || 'N/A'} 
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Verified Status</label>
                    <input 
                      type="text" 
                      value={selectedUser.isVerified ? 'Verified' : 'Unverified'} 
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Active Status</label>
                    <input 
                      type="text" 
                      value={selectedUser.isActive ? 'Active' : 'Inactive'} 
                      readOnly
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Role *</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                      required
                    >
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div style={{ 
                    padding: '0.75rem', 
                    background: '#fef3c7', 
                    border: '1px solid #fbbf24', 
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#92400e'
                  }}>
                    ⚠️ <strong>Note:</strong> Only the role can be modified. Other information is read-only.
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn secondary" onClick={() => setShowEditUserModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn primary" disabled={usersLoading}>
                    {usersLoading ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="admin-logo-text">
              <h2>Movie88</h2>
              <span>Admin Portal</span>
            </div>
          </div>
        </div>

        <div className="admin-user-info">
          <div className="admin-user-avatar-large">
            {user?.username?.substring(0, 2).toUpperCase() || user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="admin-user-details">
            <h3>{user?.fullName || 'Admin User'}</h3>
            <p>{user?.roleName || 'Administrator'}</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>User Management</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Toggle Sidebar Button */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
            {isSidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>

        <div className="admin-content-header">
          <h1 className="admin-page-title">
            {activeTab === 'dashboard' ? 'Dashboard' : 'User Management'}
          </h1>
          <p className="admin-page-description">
            {activeTab === 'dashboard' 
              ? 'Overview of system statistics and performance' 
              : 'Manage system users and permissions'}
          </p>
        </div>

        <div className="admin-content-body">
          {activeTab === 'dashboard' ? renderDashboard() : renderUserManagement()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
