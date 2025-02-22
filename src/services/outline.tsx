import axios from 'axios';
import { API_URL, HTTP_PREFIX } from '../helper/Constants';

export const fetchOutline = async (
  bid_id: string, 
  tokenRef: React.MutableRefObject<string>,
  setSharedState: (state: any) => void
) => {
  try {
    const response = await axios.get(
      `http${HTTP_PREFIX}://${API_URL}/get_outline/${bid_id}`,
      {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
        }
      }
    );
    
    setSharedState((prev: any) => ({
      ...prev,
      outline: response.data
    }));

    return response.data;
  } catch (error) {
    console.error('Error fetching outline:', error);
    throw error;
  }
}; 