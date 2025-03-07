import axios, { AxiosResponse } from "axios";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";

interface SendEmailParams {
  /** Email address of the recipient */
  recipient: string;
  /** Email message content */
  message: string;
  /** Optional email subject */
  subject?: string;
  /** Authentication token */
  token: string;
  /** Optional callback function on success */
  onSuccess?: (data: EmailResponseSuccess) => void;
  /** Optional callback function on error */
  onError?: (error: string) => void;
}

interface EmailResponseSuccess {
  success: true;
  message: string;
  message_id: string;
}

interface EmailResponseError {
  error: string;
}

type EmailResponse = EmailResponseSuccess | EmailResponseError;

/**
 * Send an email to an organization member
 * @param params - The email parameters
 * @returns Promise that resolves with the response data
 */
const sendOrganizationEmail = async ({
  recipient,
  message,
  subject = "",
  token,
  onSuccess,
  onError
}: SendEmailParams): Promise<EmailResponse> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append("recipient", recipient);
    formData.append("message", message);
    formData.append("subject", subject);

    // Send request
    const response: AxiosResponse = await axios.post(
      `http${HTTP_PREFIX}://${API_URL}/send_organisation_email`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    // Check for success
    if (response.data.success) {
      const successResponse = response.data as EmailResponseSuccess;

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(successResponse);
      }

      return successResponse;
    } else {
      // Handle API error response
      const errorMessage = response.data.error || "Failed to send email";
      const errorResponse: EmailResponseError = { error: errorMessage };

      // Call error callback if provided
      if (onError) {
        onError(errorMessage);
      }

      return errorResponse;
    }
  } catch (error: any) {
    // Handle exceptions
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to send email";
    const errorResponse: EmailResponseError = { error: errorMessage };

    // Call error callback if provided
    if (onError) {
      onError(errorMessage);
    }

    return errorResponse;
  }
};

export default sendOrganizationEmail;
