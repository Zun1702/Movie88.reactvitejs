/**
 * Format date/time to Vietnam timezone (UTC+7)
 * @param {string|Date} dateString - The date string or Date object to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted date string in Vietnam timezone
 */
export const formatToVietnamTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Default options for Vietnam timezone
    const defaultOptions = {
      timeZone: 'Asia/Ho_Chi_Minh', // UTC+7
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
      ...options
    };

    return date.toLocaleString('vi-VN', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date only (without time) to Vietnam timezone
 * @param {string|Date} dateString - The date string or Date object to format
 * @returns {string} - Formatted date string
 */
export const formatToVietnamDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only (without date) to Vietnam timezone
 * @param {string|Date} dateString - The date string or Date object to format
 * @returns {string} - Formatted time string
 */
export const formatToVietnamTimeOnly = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }

    return date.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Get current time in Vietnam timezone as ISO string
 * @returns {string} - ISO string in Vietnam timezone
 */
export const getCurrentVietnamTime = () => {
  const now = new Date();
  
  // Get Vietnam time (UTC+7)
  const vietnamTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh'
  }));
  
  return vietnamTime.toISOString();
};
