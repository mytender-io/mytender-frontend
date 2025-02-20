import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFileAlt,
  faSort,
  faSortUp,
  faSortDown,
  faCheck,
  faXmark,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import UploadPDF from "./UploadPDF.tsx";
import { toast } from "react-toastify";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const DeleteConfirmation = ({ onConfirm, onCancel, isDeleting }) => {
  if (isDeleting) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        onClick={onConfirm}
        variant="ghost"
        size="icon"
        className="h-6 w-6 min-w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
      </Button>
      <Button
        onClick={onCancel}
        variant="ghost"
        size="icon"
        className="h-6 w-6 min-w-6 text-gray-900 hover:text-gray-700 hover:bg-gray-50"
      >
        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
      </Button>
    </div>
  );
};

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
    filename: null
  });
  const [documentListVersion, setDocumentListVersion] = useState(0);

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
    if (!isSorted) return faSort;
    return sortOrder === "asc" ? faSortUp : faSortDown;
  };

  const handleDeleteInitiate = (event, filename) => {
    event.stopPropagation();
    posthog.capture("tender_library_delete_file_clicked", { filename });
    setDeleteConfirmationState({
      showFor: filename,
      filename: filename
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
      toast.success("Document deleted successfully");

      // If the deleted file was being viewed, return to the library view
      if (selectedFile === filename) {
        handleBackToLibrary();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      if (error.response) {
        toast.error(`Error deleting document: ${error.response.data.detail}`);
      } else if (error.request) {
        toast.error("Error deleting document: No response from server");
      } else {
        toast.error("Error deleting document: Request setup failed");
      }
    }
  };

  const handleFileSelect = async (fileName) => {
    try {
      setIsLoading(true);
      setSelectedFile(fileName);

      const formData = new FormData();
      formData.append("bid_id", object_id);
      formData.append("file_name", fileName);

      const fileExtension = fileName.split(".").pop().toLowerCase();

      if (fileExtension === "pdf") {
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
        toast.warning("Excel files viewing not supported yet");
        setSelectedFile(null);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Error viewing file");
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setSelectedFile(null);
    setFileContent(null);
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
        setDocuments(response.data.filenames);
      }
    } catch (error) {
      console.error("Error fetching tender library filenames:", error);
      toast.error("Error fetching documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [object_id, documentListVersion]);

  const renderFileContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const fileExtension = selectedFile.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      return (
        <iframe
          src={fileContent}
          className="h-[600px] w-full rounded border border-border"
        />
      );
    } else if (["doc", "docx"].includes(fileExtension)) {
      return (
        <pre className="h-[600px] w-full overflow-x-hidden whitespace-pre-wrap break-words rounded border border-border p-5 text-sm">
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
          <div className="mb-4 mt-4 flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="mr-3 cursor-pointer text-lg"
              onClick={handleBackToLibrary}
            />
            <span className="text-xl font-bold">Back to Tender Upload</span>
          </div>
          {renderFileContent()}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <UploadPDF
          bid_id={object_id}
          get_collections={fetchDocuments}
          apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
          descriptionText="Upload documents and attachments that are part of the tender"
        />
        <div className="rounded-md border shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 cursor-pointer select-none">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleSort}
                  >
                    Filename
                    <FontAwesomeIcon
                      icon={getSortIcon()}
                      className={`h-4 w-4 ${
                        isSorted ? "text-gray-900" : "text-gray-400"
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 cursor-pointer select-none">
                  Upload Date
                </TableHead>
                <TableHead className="text-sm text-typo-900 font-semibold py-3.5 px-4 cursor-pointer select-none">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleFileSelect(doc.filename || doc)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-muted-foreground"
                      />
                      <span>{doc.filename || doc}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {formatDate(doc.upload_date)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteConfirmationState.showFor ===
                    (doc.filename || doc) ? (
                      <DeleteConfirmation
                        onConfirm={(e) =>
                          handleDeleteConfirm(e, doc.filename || doc)
                        }
                        onCancel={handleDeleteCancel}
                        isDeleting={isDeletingFile}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 min-w-6"
                        onClick={(e) =>
                          handleDeleteInitiate(e, doc.filename || doc)
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div id="tender-library">{renderLibraryView()}</div>
    </div>
  );
};

export default TenderLibrary;
