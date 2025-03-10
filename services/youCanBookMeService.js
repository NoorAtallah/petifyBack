const axios = require('axios');

const YOUCANBOOK_API_URL = 'https://api.youcanbook.me/v1';
const YOUCANBOOK_API_KEY = process.env.YOUCANBOOK_API_KEY;

exports.fetchNewBookings = async (since) => {
  try {
    const response = await axios.get(`${YOUCANBOOK_API_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${YOUCANBOOK_API_KEY}`,
      },
      params: {
        updatedFrom: since.toISOString(),
        // Add any other necessary parameters
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching new bookings from YouCanBook.me:', error);
    throw error;
  }
};