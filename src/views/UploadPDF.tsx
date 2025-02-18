import React, { useRef, useState } from "react";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { displayAlert } from "../helper/Alert";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UploadPDF.css";
import {
  faFileArrowUp,
  faFilePdf,
  faFile,
  faFileExcel,
  faFileWord
} from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";

interface UploadResult {
  error?: Error;
  data?: any;
}
interface UploadPDFProps {
  folder?: string;
  bid_id?: string;
  get_collections?: () => void;
  onClose?: () => void;
  onUploadComplete?: (files: File[]) => void;
  apiUrl: string;
  descriptionText: string;
}

interface UploadProgress {
  [key: string]: number;
}

const UploadPDF: React.FC<UploadPDFProps> = ({
  folder,
  bid_id,
  get_collections,
  onClose,
  onUploadComplete,
  apiUrl,
  descriptionText
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    // Only handle file selection if not currently uploading
    if (!isUploading && e.target.files && e.target.files.length > 0) {
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
    const validFiles = [];
    const invalidFiles = [];

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
      displayAlert(
        "Some files were not added. Only PDF (.pdf), Word (.docx), and Excel (.xlsx, .xls) files are allowed.",
        "danger"
      );
      posthog.capture("pdf_upload_invalid_file_types", {
        fileCount: invalidFiles.length,
        fileTypes: invalidFiles.map((f) => f.type)
      });
    }
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    posthog.capture("pdf_upload_started", {
      fileName: file.name,
      fileType: file.type
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

    if (bid_id) {
      formData.append("bid_id", bid_id);
    }

    const fileSizeInMB = file.size / (1024 * 1024);
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
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: artificialProgress
      }));
    }, 1000);

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenRef.current}`
        }
      });

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 100
      }));

      // Remove the completed file from selectedFiles
      setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name));

      return { data: response.data, fileName: file.name };
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      displayAlert("No files selected", "warning");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = selectedFiles.map((file) => uploadFile(file));
      const results: UploadResult[] = await Promise.all(
        uploadPromises.map((p) =>
          p
            .then((data) => ({ data, fileName: data.fileName }))
            .catch((error) => ({ error: error as Error }))
        )
      );

      const successCount = results.filter((result) => !result.error).length;
      const failCount = results.filter((result) => result.error).length;

      if (successCount > 0) {
        displayAlert(
          `Successfully uploaded ${successCount} file(s)`,
          "success"
        );
        posthog.capture("pdf_upload_batch_completed", {
          successCount,
          failCount,
          totalFiles: selectedFiles.length
        });

        // Call onUploadComplete with successfully uploaded files
        if (onUploadComplete) {
          const successfulFiles = selectedFiles.filter((file) =>
            results.some(
              (result) => !result.error && result.fileName === file.name
            )
          );
          onUploadComplete(successfulFiles);
        }
      }

      if (failCount > 0) {
        displayAlert(`Failed to upload ${failCount} file(s)`, "danger");
      }

      // Clear progress for completed uploads
      setUploadProgress({});
    } catch (error) {
      console.error("Error in batch upload:", error);
      displayAlert("Error uploading files", "danger");
    } finally {
      setIsUploading(false);
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
      <div className="selected-files">
        {selectedFiles.map((file, index) => (
          <div key={index} className="file-item">
            <div className="file-info">
              <FontAwesomeIcon
                icon={getFileIcon(file.type)}
                className="file-icon"
              />
              <span className="file-name">{file.name}</span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${uploadProgress[file.name] || 0}%`
                }}
              />
            </div>
            <span className="progress-text">
              {uploadProgress[file.name] || 0}%
            </span>
          </div>
        ))}
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
    <div>
      <p className="description-text mt-4 mb-4">{descriptionText}</p>

      <div
        className={`drop-zone ${dragActive ? "active" : ""} ${
          isUploading ? "disabled" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current.click()}
        style={{
          border: "2px dashed #cccccc",
          borderRadius: "4px",
          padding: "30px",
          textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          backgroundColor: dragActive ? "#f0f0f0" : "white",
          opacity: isUploading ? 0.6 : 1,
          transition: "all 0.3s ease"
        }}
      >
        <div className="upload-container">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="file-input"
            multiple
            disabled={isUploading}
          />
          <div className="upload-icon-wrapper">
            <div className="circle-background"></div>
            <FontAwesomeIcon icon={faFileArrowUp} className="upload-icon" />
          </div>
          <div className="upload-text">
            {isUploading
              ? "Upload in progress..."
              : "Click to Upload or drag and drop"}
          </div>
          <div className="upload-subtext">Maximum file size 50 MB</div>
        </div>
      </div>

      {renderSelectedFiles()}

      {selectedFiles.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="upload-button"
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} File${
                  selectedFiles.length !== 1 ? "s" : ""
                }`}
          </Button>
        </div>
      )}
    </div>
  );
};
export default UploadPDF;
