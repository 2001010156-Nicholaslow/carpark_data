import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getCarparkAvailability = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/carparks/availability`);
    return response.data;
  } catch (error) {
    console.error('Error fetching carpark data:', error);
    throw error;
  }
};