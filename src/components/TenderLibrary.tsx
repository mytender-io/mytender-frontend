import React, { useEffect, useRef, useState } from "react";
import {
  Loader,
  FileText,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Check,
  X
} from "lucide-react";
import UploadPDF from "../views/UploadPDF.tsx";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import { displayAlert } from "@/helper/Alert.tsx";
import { useAuthUser } from "react-auth-kit";

const DeleteConfirmation = ({ onConfirm, onCancel, isDeleting }) => {
  if (isDeleting) {
    return (
      <div className="flex justify-center">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-2">
      <Check
        className="w-6 h-6 text-green-600 cursor-pointer"
        onClick={onConfirm}
      />
      <X className="w-6 h-6 text-black cursor-pointer" onClick={onCancel} />
    </div>
  );
};
const PDFErrorView = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
    <div className="text-2xl text-gray-600 mb-4">No PDF Found</div>
    <div className="text-gray-500">Please try uploading the file again</div>
  </div>
);

const TenderLibrary = ({ object_id }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSorted, setIsSorted] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [deleteConfirmationState, setDeleteConfirmationState] = useState({
    showFor: null,
    filename: null,
    index: null  // Add index to track specific file
  });
  
  const [documentListVersion, setDocumentListVersion] = useState(0);
  const [hasPDFError, setHasPDFError] = useState(false);

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setIsSorted(true);

    const sortedDocs = [...documents].sort((a, b) => {
      const filenameA = (a.filename || a).toLowerCase();
      const filenameB = (b.filename || b).toLowerCase();
      return newSortOrder === "asc"
        ? filenameA.localeCompare(filenameB)
        : filenameB.localeCompare(filenameA);
    });

    setDocuments(sortedDocs);
  };

  const getSortIcon = () => {
    if (!isSorted) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleDeleteInitiate = (event, filename, index) => {
    event.stopPropagation();
    setDeleteConfirmationState({
      showFor: `${filename}-${index}`,  // Create unique identifier
      filename: filename,
      index: index
    });
  };
  
  const handleDeleteConfirm = async (event, filename) => {
    event.stopPropagation();
    setIsDeletingFile(true);
    await deleteDocument(filename, object_id);
    setIsDeletingFile(false);
    setDeleteConfirmationState({ showFor: null, filename: null });
  };

  const handleDeleteCancel = (event) => {
    event.stopPropagation();
    setDeleteConfirmationState({ showFor: null, filename: null });
  };

  const deleteDocument = async (filename, bidId) => {
    const formData = new FormData();
    formData.append("bid_id", bidId);
    formData.append("filename", filename);

    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/delete_file_tenderlibrary`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      fetchDocuments();
      setDocumentListVersion((prev) => prev + 1);

      if (selectedFile === filename) {
        handleBackToLibrary();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleFileSelect = async (fileName) => {
    try {
      setIsLoading(true);
      setSelectedFile(fileName);
      setHasPDFError(false);

      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("file_name", fileName);

      const fileExtension = fileName.split(".").pop().toLowerCase();

      if (fileExtension === "pdf") {
        try {
          const response = await axios.post(
            `http${HTTP_PREFIX}://${API_URL}/show_tenderLibrary_file_content_pdf_format`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${tokenRef.current}`,
                "Content-Type": "multipart/form-data"
              },
              responseType: "blob"
            }
          );

          const fileURL = URL.createObjectURL(
            new Blob([response.data], { type: "application/pdf" })
          );
          setFileContent(fileURL);
        } catch (error) {
          console.error("Error loading PDF:", error);
          setHasPDFError(true);
        }
      } else if (["doc", "docx"].includes(fileExtension)) {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/show_tenderLibrary_file_content_word_format`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        setFileContent(response.data.content);
      } else if (["xls", "xlsx"].includes(fileExtension)) {
        // Handle Excel files
        setSelectedFile(null);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setSelectedFile(null);
    setFileContent(null);
    setHasPDFError(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [day, month, year] = dateStr.split("/");
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-GB");
  };

  const fetchDocuments = async () => {
    try {
      if (object_id) {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_tender_library_doc_filenames`,
          { bid_id: object_id },
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data && response.data.filenames) {
          setDocuments(response.data.filenames);
        } else {
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching tender library filenames:", error);
      displayAlert("Error fetching documents", "danger");
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [object_id, documentListVersion]);

  const renderFileContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <Loader className="animate-spin h-8 w-8 text-black" />
        </div>
      );
    }

    const fileExtension = selectedFile?.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      if (hasPDFError) {
        return (
          <div className="relative h-[600px] border border-gray-300 rounded">
            <PDFErrorView />
          </div>
        );
      }
      return (
        <iframe
          src={fileContent}
          className="w-full h-[600px] border border-gray-300 rounded"
        />
      );
    } else if (["doc", "docx"].includes(fileExtension)) {
      return (
        <pre className="w-full h-[600px] p-5 whitespace-pre-wrap break-words overflow-x-hidden rounded border border-gray-300 text-lg">
          {fileContent}
        </pre>
      );
    }

    return null;
  };

  const renderLibraryView = () => {
    if (selectedFile) {
      return (
        <div>
          <div className="flex items-center mb-4 mt-4">
            <button
              onClick={handleBackToLibrary}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-2xl font-bold">Back to Tender Upload</span>
            </button>
          </div>
          {renderFileContent()}
        </div>
      );
    }

    return (
      <>
        <UploadPDF
          bid_id={object_id}
          get_collections={fetchDocuments}
          apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
          descriptionText="Upload documents and attachments that are part of the tender"
        />

        <div className="w-full mt-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xl">
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center space-x-2 text-gray-700"
                      onClick={handleSort}
                    >
                      <span>Filename</span>
                      {getSortIcon()}
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">Upload Date</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents &&
                  documents.map((doc, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer text-xl"
                      onClick={() => handleFileSelect(doc.filename || doc)}
                    >
                      <td className="px-4 py-3 flex items-center">
                        <FileText className="w-6 h-6 mr-3 text-gray-500" />
                        {doc.filename || doc}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(doc.upload_date)}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deleteConfirmationState.showFor ===
                        `${doc.filename || doc}-${index}` ? (
                          <DeleteConfirmation
                            onConfirm={(e) =>
                              handleDeleteConfirm(e, doc.filename || doc)
                            }
                            onCancel={handleDeleteCancel}
                            isDeleting={isDeletingFile}
                          />
                        ) : (
                          <button
                            onClick={(e) =>
                              handleDeleteInitiate(
                                e,
                                doc.filename || doc,
                                index
                              )
                            }
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full">
      <div id="tender-library"></div>
      {renderLibraryView()}
    </div>
  );
};

export default TenderLibrary;
