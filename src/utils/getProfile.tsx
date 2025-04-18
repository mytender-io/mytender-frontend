import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";

/**
 * Interface for user profile data
 */
export interface UserProfile {
  login: string;
  company_logo?: string;
  email: string;
  userType?: string;
  [key: string]: any; // For any additional properties
}

/**
 * Fetches the user profile data
 * @param token Authentication token
 * @returns Promise resolving to user profile data
 */
export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  try {
    const response = await axios.get(
      `http${HTTP_PREFIX}://${API_URL}/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};
