import * as types from '../../actions/admin/dashboardActionTypes.jsx';

const initialState = {
  stats: {
    todayRevenue: 0,
    todayBookings: 0,
    activeMovies: 0,
    activeCustomers: 0,
  },
  popularMovies: [],
  upcomingShowtimes: [],
  bookingStats: {
    totalBookings: 0,
    completedBookings: 0,
    canceledBookings: 0,
    checkedInBookings: 0,
    cancellationRate: '0%',
    checkInRate: '0%',
    averageBookingValue: 0,
    peakHours: [],
    peakDays: [],
    conversionRate: '0%',
  },
  customerAnalytics: {
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    retentionRate: '0%',
    churnRate: '0%',
    averageLifetimeValue: 0,
    topCustomers: [],
    demographics: {
      age: {},
      gender: {},
    },
  },
  revenueReport: {
    period: '',
    totalRevenue: 0,
    totalBookings: 0,
    averageTicketPrice: 0,
    breakdown: {
      ticketSales: 0,
      concessions: 0,
    },
    byMovie: [],
    byCinema: [],
    byHour: [],
  },
  users: {
    items: [],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  loading: false,
  bookingStatsLoading: false,
  customerAnalyticsLoading: false,
  revenueReportLoading: false,
  usersLoading: false,
  error: null,
  bookingStatsError: null,
  customerAnalyticsError: null,
  revenueReportError: null,
  usersError: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ADMIN_STATS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_ADMIN_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: {
          todayRevenue: action.payload.todayRevenue,
          todayBookings: action.payload.todayBookings,
          activeMovies: action.payload.activeMovies,
          activeCustomers: action.payload.activeCustomers,
        },
        popularMovies: action.payload.popularMovies || [],
        upcomingShowtimes: action.payload.upcomingShowtimes || [],
        error: null,
      };

    case types.FETCH_ADMIN_STATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.FETCH_BOOKING_STATS_REQUEST:
      return {
        ...state,
        bookingStatsLoading: true,
        bookingStatsError: null,
      };

    case types.FETCH_BOOKING_STATS_SUCCESS:
      return {
        ...state,
        bookingStatsLoading: false,
        bookingStats: action.payload,
        bookingStatsError: null,
      };

    case types.FETCH_BOOKING_STATS_FAILURE:
      return {
        ...state,
        bookingStatsLoading: false,
        bookingStatsError: action.payload,
      };

    case types.FETCH_CUSTOMER_ANALYTICS_REQUEST:
      return {
        ...state,
        customerAnalyticsLoading: true,
        customerAnalyticsError: null,
      };

    case types.FETCH_CUSTOMER_ANALYTICS_SUCCESS:
      return {
        ...state,
        customerAnalyticsLoading: false,
        customerAnalytics: action.payload,
        customerAnalyticsError: null,
      };

    case types.FETCH_CUSTOMER_ANALYTICS_FAILURE:
      return {
        ...state,
        customerAnalyticsLoading: false,
        customerAnalyticsError: action.payload,
      };

    case types.FETCH_REVENUE_REPORT_REQUEST:
      return {
        ...state,
        revenueReportLoading: true,
        revenueReportError: null,
      };

    case types.FETCH_REVENUE_REPORT_SUCCESS:
      return {
        ...state,
        revenueReportLoading: false,
        revenueReport: action.payload,
        revenueReportError: null,
      };

    case types.FETCH_REVENUE_REPORT_FAILURE:
      return {
        ...state,
        revenueReportLoading: false,
        revenueReportError: action.payload,
      };

    case types.FETCH_USERS_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };

    case types.FETCH_USERS_SUCCESS:
      return {
        ...state,
        usersLoading: false,
        users: action.payload,
        usersError: null,
      };

    case types.FETCH_USERS_FAILURE:
      return {
        ...state,
        usersLoading: false,
        usersError: action.payload,
      };

    case types.CREATE_USER_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };

    case types.CREATE_USER_SUCCESS:
      return {
        ...state,
        usersLoading: false,
        usersError: null,
      };

    case types.CREATE_USER_FAILURE:
      return {
        ...state,
        usersLoading: false,
        usersError: action.payload,
      };

    case types.UPDATE_USER_ROLE_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };

    case types.UPDATE_USER_ROLE_SUCCESS:
      return {
        ...state,
        usersLoading: false,
        usersError: null,
      };

    case types.UPDATE_USER_ROLE_FAILURE:
      return {
        ...state,
        usersLoading: false,
        usersError: action.payload,
      };

    case types.TOGGLE_USER_STATUS_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };

    case types.TOGGLE_USER_STATUS_SUCCESS:
      return {
        ...state,
        usersLoading: false,
        usersError: null,
      };

    case types.TOGGLE_USER_STATUS_FAILURE:
      return {
        ...state,
        usersLoading: false,
        usersError: action.payload,
      };

    case types.CLEAR_ADMIN_STATS_ERROR:
      return {
        ...state,
        error: null,
        bookingStatsError: null,
        customerAnalyticsError: null,
        revenueReportError: null,
        usersError: null,
      };

    default:
      return state;
  }
};

export default dashboardReducer;
