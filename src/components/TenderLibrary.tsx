import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { Col, Row, Spinner } from "react-bootstrap";
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
import { displayAlert } from "../helper/Alert.tsx";
import posthog from "posthog-js";
import UploadPDF from "../views/UploadPDF.tsx";
import "./TenderLibrary.css";

const DeleteConfirmation = ({ onConfirm, onCancel, isDeleting }) => {
  if (isDeleting) {
    return <Spinner animation="border" size="md" />;
  }

  return (
    <div>
      <FontAwesomeIcon
        icon={faCheck}
        style={{
          width: "20px",
          height: "20px",
          color: "#16a34a",
          cursor: "pointer"
        }}
        onClick={onConfirm}
        className="me-2"
      />
      <FontAwesomeIcon
        icon={faXmark}
        style={{
          width: "20px",
          height: "20px",
          color: "black",
          cursor: "pointer"
        }}
        onClick={onCancel}
      />
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
      displayAlert("Document deleted successfully", "success");

      // If the deleted file was being viewed, return to the library view
      if (selectedFile === filename) {
        handleBackToLibrary();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      if (error.response) {
        displayAlert(
          `Error deleting document: ${error.response.data.detail}`,
          "danger"
        );
      } else if (error.request) {
        displayAlert(
          "Error deleting document: No response from server",
          "danger"
        );
      } else {
        displayAlert("Error deleting document: Request setup failed", "danger");
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
        displayAlert("Excel files viewing not supported yet", "warning");
        setSelectedFile(null);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      displayAlert("Error viewing file", "danger");
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
      displayAlert("Error fetching documents", "danger");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [object_id, documentListVersion]);

  const renderFileContent = () => {
    if (isLoading) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    const fileExtension = selectedFile.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      return (
        <iframe
          src={fileContent}
          width="100%"
          height="600px"
          style={{ border: "1px solid #ccc", borderRadius: "4px" }}
        />
      );
    } else if (["doc", "docx"].includes(fileExtension)) {
      return (
        <pre
          style={{
            width: "100%",
            height: "600px",
            padding: "20px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowX: "hidden",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        >
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
          <div className="d-flex align-items-center mb-4 mt-4">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="me-3"
              style={{
                cursor: "pointer",
                fontSize: "18px"
              }}
              onClick={handleBackToLibrary}
            />
            <span className="text-2xl font-bold">Back to Tender Upload</span>
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
        {/* Replace the table section in renderLibraryView with this */}
        <div style={{ width: "100%", marginTop: "30px" }}>
          <div className="tender-library-scroll-container">
            <table className="tender-library-table">
              <thead>
                <tr>
                  <th className="filename-column">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer"
                      }}
                      onClick={handleSort}
                    >
                      Filename
                      <FontAwesomeIcon
                        icon={getSortIcon()}
                        style={{
                          fontSize: "14px",
                          color: isSorted ? "#000" : "#999"
                        }}
                      />
                    </div>
                  </th>
                  <th className="timestamp-column">Upload Date</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr
                    key={index}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleFileSelect(doc.filename || doc)}
                  >
                    <td className="filename-column">
                      <FontAwesomeIcon icon={faFileAlt} className="fa-icon" />{" "}
                      {doc.filename || doc}
                    </td>
                    <td className="timestamp-column">
                      {formatDate(doc.upload_date)}
                    </td>
                    <td
                      className="actions-column"
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
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="action-icon delete-icon"
                          onClick={(e) =>
                            handleDeleteInitiate(e, doc.filename || doc)
                          }
                          style={{ cursor: "pointer" }}
                        />
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
    <Row>
      <Col md={12}>
        <div>
          <div id="tender-library"></div>
          {renderLibraryView()}
        </div>
      </Col>
    </Row>
  );
};

export default TenderLibrary;
