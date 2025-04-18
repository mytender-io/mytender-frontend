import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";

export interface OrganizationUser {
  username: string;
  company_logo?: string;
  email: string;
  [key: string]: any; // For any additional properties
}

/**
 * Fetches organization users
 * @param token Authentication token
 * @param includePending Whether to include pending users
 * @returns Promise resolving to array of organization users
 */

export const fetchOrganizationUsers = async (
  token: string,
  includePending: boolean = false
): Promise<OrganizationUser[]> => {
  try {
    const formData = new FormData();
    formData.append("include_pending", includePending.toString());

    const response = await axios.post(
      `http${HTTP_PREFIX}://${API_URL}/get_organization_users`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch organization users:", error);
    throw error;
  }
};
