import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import withAuth from "../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import { Button, Col, Row, Card, Modal, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFileAlt,
  faPlus,
  faSort,
  faSortUp,
  faSortDown,
  faCheck,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@mui/material";
import { displayAlert } from "../helper/Alert.tsx";
import InterrogateTenderModal from "../modals/InterrogateTenderModal.tsx";
import posthog from "posthog-js";
import UploadPDF from "./UploadPDF.tsx";
import "./TenderLibrary.css";
import { Check, X } from "lucide-react";

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
  const [currentFileName, setCurrentFileName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [totalPages, setTotalPages] = useState(0);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [documentListVersion, setDocumentListVersion] = useState(0);
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordFileContent, setWordFileContent] = useState(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSorted, setIsSorted] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [deleteConfirmationState, setDeleteConfirmationState] = useState({
    showFor: null,
    filename: null
  });

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setIsSorted(true);

    const sortedDocs = [...documents].sort((a, b) => {
      const filenameA = (a.filename || a).toLowerCase();
      const filenameB = (b.filename || b).toLowerCase();

      if (newSortOrder === "asc") {
        return filenameA.localeCompare(filenameB);
      } else {
        return filenameB.localeCompare(filenameA);
      }
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
        const pages = Math.ceil(response.data.filenames.length / rowsPerPage);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error("Error fetching tender library filenames:", error);
      displayAlert("Error fetching documents", "danger");
    }
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

  useEffect(() => {
    fetchDocuments();
  }, [object_id, documentListVersion]);

  const renderDocuments = () => {
    return documents.map((doc, index) => (
      <tr key={index} style={{ cursor: "pointer" }}>
        <td className="filename-column">
          <FontAwesomeIcon icon={faFileAlt} className="fa-icon" />{" "}
          {doc.filename || doc}
        </td>
        <td className="timestamp-column">
          {doc.upload_date
            ? new Date(doc.upload_date).toLocaleDateString("en-GB")
            : "N/A"}
        </td>
        <td className="actions-column">
          {deleteConfirmationState.showFor === (doc.filename || doc) ? (
            <DeleteConfirmation
              onConfirm={(e) => handleDeleteConfirm(e, doc.filename || doc)}
              onCancel={handleDeleteCancel}
              isDeleting={isDeletingFile}
            />
          ) : (
            <FontAwesomeIcon
              icon={faTrash}
              className="action-icon delete-icon"
              onClick={(e) => handleDeleteInitiate(e, doc.filename || doc)}
              style={{ cursor: "pointer" }}
            />
          )}
        </td>
      </tr>
    ));
  };

  const handleOnClose = () => {
    setShowPDFModal(false);
    fetchDocuments();
  };

  return (
    <>
      <Row>
        <Col md={12}>
          <div>
            <div id="tender-library"></div>
            <UploadPDF
              bid_id={object_id}
              get_collections={fetchDocuments}
              apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile_tenderlibrary`}
              descriptionText="Upload documents and attachments that are part of the tender"
            />
            <div style={{ width: "100%", marginTop: "30px" }}>
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
              </table>

              <div
                style={{
                  overflowY: "auto",
                  maxHeight: "400px",
                  height: "100%",
                  width: "100%"
                }}
              >
                <table
                  style={{ width: "100%" }}
                  className="tender-library-table"
                >
                  <tbody>{renderDocuments()}</tbody>
                </table>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {showPdfViewerModal && (
        <div
          className="pdf-viewer-modal"
          onClick={() => setShowPdfViewerModal(false)}
        >
          <div
            className="pdf-viewer-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {isPdfLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "600px"
                }}
              >
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <iframe src={pdfUrl} width="100%" height="600px"></iframe>
            )}
          </div>
        </div>
      )}

      {showWordModal && (
        <Modal
          show={showWordModal}
          onHide={() => setShowWordModal(false)}
          size="lg"
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ textAlign: "center" }}>
              File Content
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "600px" }}>
            <pre
              style={{
                width: "100%",
                height: "100%",
                padding: "20px",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowX: "hidden",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              {wordFileContent}
            </pre>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default TenderLibrary;
