import React, { useRef, useState } from "react";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileZipper } from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import UploadIcon from "@/components/icons/UploadIcon";
import FileIcon from "@/components/icons/FileIcon";
import { toast } from "react-toastify";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";

interface UploadResult {
  error?: Error;
  data?: any;
}

interface UploadZipProps {
  folder?: string;
  bid_id?: string;
  get_collections?: () => void;
  onClose?: () => void;
  onUploadComplete?: (file: File) => void;
  descriptionText?: string;
}

const UploadZip: React.FC<UploadZipProps> = ({
  folder,
  bid_id,
  get_collections,
  onClose,
  onUploadComplete,
  descriptionText
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only handle drag events if not currently uploading
    if (!isUploading) {
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Only handle drop if not currently uploading
    if (
      !isUploading &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    // Only handle file selection if not currently uploading
    if (!isUploading && e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const isZipFile = (file: File): boolean => {
    // Check MIME types
    const allowedMimeTypes = [
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip"
    ];

    // Check file extensions
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    return allowedMimeTypes.includes(file.type) || fileExtension === ".zip";
  };

  const handleFile = (newFile: File) => {
    // Clear any previous error messages when selecting a new file
    setErrorMessage(null);

    if (isZipFile(newFile)) {
      setSelectedFile(newFile);
      posthog.capture("zip_upload_file_selected", {
        fileName: newFile.name,
        fileSize: newFile.size
      });
    } else {
      toast.error("Only ZIP files (.zip) are allowed.");
      posthog.capture("zip_upload_invalid_file_type", {
        fileType: newFile.type
      });
    }
  };

  const uploadFile = async (): Promise<UploadResult> => {
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    posthog.capture("zip_upload_started", {
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    });

    const formData = new FormData();
    formData.append("zip_file", selectedFile);

    if (folder) {
      formData.append("profile_name", folder);
    }

    if (bid_id) {
      formData.append("bid_id", bid_id);
    }

    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    const durationPerMB = 30000;
    const duration = Math.max(
      10000,
      Math.min(300000, Math.round(fileSizeInMB * durationPerMB))
    );

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const artificialProgress = Math.min(
        95,
        Math.round((elapsed / duration) * 100)
      );
      setUploadProgress(artificialProgress);
    }, 1000);

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/upload_zip`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait for 2 seconds before clearing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return { data: response.data };
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0); // Reset progress on error
      console.error("Error uploading zip file:", error);

      // Extract the specific error message from the backend response
      let errorMessage = "Error uploading ZIP file";

      if (error.response) {
        // Handle specific error status codes
        if (error.response.status === 403) {
          // Permission error (non-owner trying to upload)
          errorMessage =
            error.response.data?.detail ||
            "Permission denied: Only owners can upload to content library";

          // Track specific permission errors in analytics
          posthog.capture("zip_upload_permission_error", {
            fileName: selectedFile.name,
            errorDetail: errorMessage
          });
        } else if (error.response.data?.detail) {
          // Other errors with detail messages from backend
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 413) {
          errorMessage = "File too large. Please upload a smaller ZIP file.";
        }
      }

      // Create a custom error with the extracted message
      const customError = new Error(errorMessage);
      throw customError;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No ZIP file selected");
      return;
    }

    // Clear any previous error message
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const result = await uploadFile();

      toast.success("Successfully uploaded ZIP file");
      posthog.capture("zip_upload_completed", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      });

      // Call onUploadComplete with successfully uploaded file
      if (onUploadComplete) {
        onUploadComplete(selectedFile);
      }

      // Clear progress and selection
      setUploadProgress(0);
      setSelectedFile(null);

      // Allow some time for backend processing before refreshing
      setTimeout(() => {
        if (get_collections) {
          get_collections();
        }
        if (onClose) {
          onClose();
        }
      }, 1000);
    } catch (error) {
      console.error("Error in upload:", error);
      setUploadProgress(0);

      // Set the error message for display in the UI
      setErrorMessage(error.message || "Error uploading ZIP file");

      // Display the specific error message from the backend as a toast notification
      toast.error(error.message || "Error uploading ZIP file");

      posthog.capture("zip_upload_failed", {
        fileName: selectedFile?.name,
        error: error.message
      });

      // Keep the selected file so the user can try again if needed
      // Only clear the selection for permission errors as they won't be resolvable by retrying
      if (error.message === "Only owners can upload to content library") {
        setSelectedFile(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const renderSelectedFile = () => {
    if (!selectedFile) return null;

    return (
      <div className="w-full mt-5">
        <div className="flex items-center p-3.5 bg-white rounded-lg mb-2.5 border-2 border-gray-200">
          <div className="flex items-center flex-1 mr-4">
            <FontAwesomeIcon
              icon={faFileZipper}
              className="mr-3 text-gray-700 text-xl"
            />
            <span className="flex-1 text-gray-700 text-sm truncate max-w-52">
              {selectedFile.name}
            </span>
          </div>

          <div className="flex-1">
            <Progress value={uploadProgress || 0} />
          </div>
          <span className="min-w-[45px] text-right ml-2.5 text-gray-600 text-sm">
            {uploadProgress || 0}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded shadow-sm">
      {descriptionText ? (
        <p className="font-medium my-4 mt-0">{descriptionText}</p>
      ) : null}

      {/* Display error message with additional guidance for permission errors */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="text-sm font-medium">{errorMessage}</p>
          {errorMessage === "Only owners can upload to content library" && (
            <p className="text-xs mt-1">
              Please contact your organization owner to get upload permissions.
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-5 text-center relative",
          dragActive ? "bg-gray-50" : "bg-white",
          isUploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          "transition-all duration-300"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current.click()}
      >
        <div className="relative flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="relative flex items-center justify-center mb-2.5 w-20 h-20">
            <FileIcon className="w-full h-full text-gray-hint_text" />
            <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-orange rounded-full">
              <UploadIcon className="w-5 h-5" />
            </div>
          </div>
          <span className="font-bold">
            {isUploading
              ? "Upload in progress..."
              : "Click to Upload or drag and drop ZIP file"}
          </span>
          <span className="text-sm text-gray-500">Maximum file size 50 MB</span>
        </div>
      </div>

      <div className="space-y-4">
        {renderSelectedFile()}

        {selectedFile && (
          <div className="text-right">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload ZIP File"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZip;
