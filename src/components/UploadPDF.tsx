import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFile,
  faFileExcel,
  faFileWord
} from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import { cn } from "@/utils";
import { Progress } from "@/components/ui/progress";
import UploadIcon from "@/components/icons/UploadIcon";
import FileIcon from "@/components/icons/FileIcon";
import { toast } from "react-toastify";

interface UploadResult {
  error?: Error;
  data?: unknown;
  fileName?: string;
  message?: string;
}

interface FileUploadTask {
  file: File;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
}

interface AxiosResponse {
  data: unknown;
  status: number;
  statusText: string;
  headers: unknown;
}



interface UploadPDFProps {
  folder?: string;
  bid_id?: string;
  get_collections?: () => void;
  onClose?: () => void;
  onUploadComplete?: (files: File[]) => void;
  apiUrl: string;
  descriptionText?: string;
  uploadedDocuments?: File[];
  isUploadingDocuments?: boolean;
  setUploadingDocuments?: (isUploadingDocuments: boolean) => void;
}

const UploadPDF: React.FC<UploadPDFProps> = ({
  folder,
  bid_id,
  get_collections,
  onClose,
  onUploadComplete,
  apiUrl,
  descriptionText,
  uploadedDocuments,
  isUploadingDocuments,
  setUploadingDocuments
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const getFileMode = (fileType: string) => {
    switch (fileType) {
      case "application/pdf":
        return "pdf";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "word";
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-excel":
        return "excel";
      default:
        return null;
    }
  };
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only handle drag events if not currently uploading
    if (!isUploadingDocuments) {
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Only handle drop if not currently uploading
    if (
      !isUploadingDocuments &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only handle file selection if not currently uploading
    if (!isUploadingDocuments && e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const isAllowedFileType = (file: File): boolean => {
    // Check MIME types
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel" // .xls
    ];

    // Check file extensions
    const allowedExtensions = [".pdf", ".docx", ".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    return (
      allowedMimeTypes.includes(file.type) &&
      allowedExtensions.includes(fileExtension)
    );
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    for (const file of newFiles) {
      if (isAllowedFileType(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);

    if (validFiles.length > 0) {
      posthog.capture("pdf_upload_files_selected", {
        fileCount: validFiles.length,
        fileTypes: validFiles.map((f) => f.type)
      });
    }

    if (invalidFiles.length > 0) {
      toast.error(
        "Some files were not added. Only PDF (.pdf), Word (.docx), and Excel (.xlsx, .xls) files are allowed."
      );
      posthog.capture("pdf_upload_invalid_file_types", {
        fileCount: invalidFiles.length,
        fileTypes: invalidFiles.map((f) => f.type)
      });
    }
  };

  const uploadFile = async (file: File, retryCount = 0): Promise<UploadResult> => {
    posthog.capture("pdf_upload_started", {
      fileName: file.name,
      fileType: file.type,
      retryCount
    });

    const mode = getFileMode(file.type);
    if (!mode) {
      throw new Error("Unsupported file type");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    if (folder) {
      formData.append("profile_name", encodeURIComponent(folder));
    }

    // Check if the API endpoint requires bid_id
    const requiresBidId = apiUrl.includes("uploadfile_tenderlibrary");

    if (bid_id && bid_id.trim() !== "") {
      formData.append("bid_id", bid_id);
    } else if (requiresBidId) {
      // If endpoint requires bid_id but it's not provided, throw an error
      throw new Error("Missing required parameter: bid_id");
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    const durationPerMB = 100000; // 3x slower than original 30000
    const duration = Math.max(
      10000,
      Math.min(900000, Math.round(fileSizeInMB * durationPerMB)) // Also increased max duration
    );

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const artificialProgress = Math.min(
        95,
        Math.round((elapsed / duration) * 100)
      );
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: artificialProgress
      }));
    }, 1000);

    try {
      // Create a timeout promise that rejects after 2 minutes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Upload timeout after 2 minutes for file: ${file.name}`));
        }, 120000); // 2 minutes
      });

      const uploadPromise = axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenRef.current}`
        },
        timeout: 120000 // 2 minutes axios timeout
      });

      const response = await Promise.race([uploadPromise, timeoutPromise]) as AxiosResponse;

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 100
      }));

      return { data: response.data, fileName: file.name };
    } catch (error: unknown) {
      clearInterval(progressInterval);
      console.error("Error uploading file:", error);

      // Extract the error message from the response if available
      let errorMessage = "Error uploading file";
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response &&
          error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
        errorMessage = String(error.response.data.detail);
      } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }

      // Set upload progress to indicate failure
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: -1 // Use a negative value to indicate error
      }));

      throw new Error(errorMessage);
    }
  };

  const uploadFileWithRetry = async (task: FileUploadTask): Promise<UploadResult> => {
    const { file, retryCount, maxRetries } = task;
    
    try {
      return await uploadFile(file, retryCount);
    } catch (error: unknown) {
      if (retryCount < maxRetries) {
        console.log(`Retrying upload for ${file.name}, attempt ${retryCount + 1}/${maxRetries}`);
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Update progress to show retry
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0
        }));
        
        return uploadFileWithRetry({
          ...task,
          retryCount: retryCount + 1
        });
      } else {
        // Max retries reached, show error toast
        const errorMessage = (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') 
          ? error.message 
          : "Error uploading file";
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        
        return {
          error: error instanceof Error ? error : new Error(String(error)),
          fileName: file.name,
          message: errorMessage
        };
      }
    }
  };

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.filter(
        (file) => !uploadedFiles.includes(file.name)
      );
      if (newFiles.length > 0) {
        handleUpload(newFiles);
      }
    }
  }, [selectedFiles]);

  useEffect(() => {
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      console.log("uploadedDocuments", uploadedDocuments);
      setSelectedFiles(uploadedDocuments);
      setUploadedFiles(uploadedDocuments.map((file) => file.name));
      setUploadProgress(
        uploadedDocuments.reduce<Record<string, number>>((acc, file) => {
          acc[file.name] = 100;
          return acc;
        }, {})
      );
    }
  }, [uploadedDocuments]);

  const handleUpload = async (filesToUpload = selectedFiles) => {
    if (filesToUpload.length === 0) {
      toast.error("No files selected");
      return;
    }

    // Check if the API endpoint requires bid_id
    const requiresBidId = apiUrl.includes("uploadfile_tenderlibrary");
    if (requiresBidId && (!bid_id || bid_id.trim() === "")) {
      toast.error("Cannot upload: Missing tender ID");
      return;
    }

    setUploadingDocuments?.(true);

    const results: UploadResult[] = [];
    let successCount = 0;
    let failCount = 0;

    try {
      // Create upload tasks with retry configuration
      const uploadTasks: FileUploadTask[] = filesToUpload.map(file => ({
        file,
        retryCount: 0,
        maxRetries: 2, // Retry up to 2 times (3 total attempts)
        timeoutMs: 120000 // 2 minutes
      }));

      // Process files in batches of 5
      const batchSize = 5;
      for (let i = 0; i < uploadTasks.length; i += batchSize) {
        const batch = uploadTasks.slice(i, i + batchSize);
        
        // Upload batch simultaneously
        const batchPromises = batch.map(task => uploadFileWithRetry(task));
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const task = batch[j];
          
          if (result.status === 'fulfilled') {
            const uploadResult = result.value;
            results.push(uploadResult);
            
            if (!uploadResult.error) {
              successCount++;
              // Track successfully uploaded file
              setUploadedFiles((prev) => [...prev, task.file.name]);
            } else {
              failCount++;
            }
          } else {
            // Promise was rejected
            results.push({
              error: new Error(result.reason?.message || "Unknown error"),
              fileName: task.file.name,
              message: result.reason?.message || "Unknown error"
            });
            failCount++;
          }
        }
      }

      if (successCount > 0) {
        posthog.capture("pdf_upload_batch_completed", {
          successCount,
          failCount,
          totalFiles: filesToUpload.length
        });

        toast.success(`Successfully uploaded ${successCount} file(s)${failCount > 0 ? ` (${failCount} failed)` : ''}`);

        // Call onUploadComplete with successfully uploaded files
        if (onUploadComplete) {
          const successfulFiles = filesToUpload.filter((file) =>
            results.some(
              (result) => !result.error && result.fileName === file.name
            )
          );
          onUploadComplete(successfulFiles);
        }
      } else if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} file(s)`);
      }
    } catch (error: unknown) {
      console.error("Error in batch upload:", error);
      const errorMessage = (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') 
        ? error.message 
        : "Unknown error";
      toast.error("Error uploading files: " + errorMessage);
    } finally {
      setUploadingDocuments?.(false);
      if (get_collections) {
        get_collections();
      }
      if (onClose) {
        onClose();
      }
    }
  };

  const renderSelectedFiles = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <div className="w-full max-h-80 overflow-y-auto mt-4">
        {selectedFiles.map((file, index) => {
          const progress = uploadProgress[file.name] || 0;
          const hasError = progress < 0;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center p-3.5 bg-white rounded-lg mb-2.5 border-2",
                hasError ? "border-red-300" : "border-gray-200"
              )}
            >
              <div className="flex items-center flex-1 mr-4">
                <FontAwesomeIcon
                  icon={getFileIcon(file.type)}
                  className={cn(
                    "mr-3 text-xl",
                    hasError ? "text-red-500" : "text-gray-700"
                  )}
                />
                <span className="flex-1 text-gray-700 text-sm truncate max-w-52">
                  {file.name}
                </span>
              </div>

              <div className="flex-1">
                <Progress
                  value={hasError ? 100 : progress}
                  className={hasError ? "bg-red-200" : ""}
                />
              </div>
              <span
                className={cn(
                  "min-w-[45px] text-right ml-2.5 text-sm",
                  hasError ? "text-red-500" : "text-gray-600"
                )}
              >
                {hasError ? "Error" : `${progress}%`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (getFileMode(fileType)) {
      case "pdf":
        return faFilePdf;
      case "word":
        return faFileWord;
      case "excel":
        return faFileExcel;
      default:
        return faFile;
    }
  };
  return (
    <div className="bg-white rounded shadow-sm p-4">
      {descriptionText ? (
        <p className="font-medium my-4 mt-0">{descriptionText}</p>
      ) : null}
      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-5 text-center relative",
          dragActive ? "bg-gray-50" : "bg-white",
          isUploadingDocuments
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer",
          "transition-all duration-300"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploadingDocuments && fileInputRef.current?.click()}
      >
        <div className="relative flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
            multiple
            disabled={isUploadingDocuments}
          />
          <div className="relative flex items-center justify-center mb-2.5 w-20 h-20">
            <FileIcon className="w-full h-full text-gray-hint_text" />
            <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-orange rounded-full">
              <UploadIcon className="w-5 h-5" />
            </div>
          </div>
          <span className="font-bold">
            {isUploadingDocuments
              ? "Upload in progress..."
              : "Click to Upload or drag and drop"}
          </span>
          <span className="text-sm text-gray-500">Maximum file size 50 MB</span>
        </div>
      </div>

      <div className="space-y-4">{renderSelectedFiles()}</div>
    </div>
  );
};

export default UploadPDF;
