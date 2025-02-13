import { useEffect, useRef, useState } from "react";
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
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import posthog from "posthog-js";
import UploadPDF from "./upload/UploadPDF.tsx";
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
    <div className="flex items-center justify-center gap-2">
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
  const rowsPerPage = 6;
  const [totalPages, setTotalPages] = useState(0);
  const [documentListVersion, setDocumentListVersion] = useState(0);
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
      toast.error("Error fetching documents");
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
      toast.success("Document deleted successfully");
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

  useEffect(() => {
    fetchDocuments();
  }, [object_id, documentListVersion]);

  const renderDocuments = () => {
    return documents.map((doc, index) => (
      <TableRow key={index} className="cursor-pointer">
        <TableCell className="w-[60%]">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faFileAlt}
              className="h-4 w-4 text-gray-500"
            />
            <span className="truncate">{doc.filename || doc}</span>
          </div>
        </TableCell>
        <TableCell className="w-[32%]">
          {doc.upload_date
            ? new Date(doc.upload_date).toLocaleDateString("en-GB")
            : "N/A"}
        </TableCell>
        <TableCell className="w-[8%] text-center">
          {deleteConfirmationState.showFor === (doc.filename || doc) ? (
            <DeleteConfirmation
              onConfirm={(e) => handleDeleteConfirm(e, doc.filename || doc)}
              onCancel={handleDeleteCancel}
              isDeleting={isDeletingFile}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={(e) => handleDeleteInitiate(e, doc.filename || doc)}
            >
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

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
          <TableBody className="text-base">{renderDocuments()}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TenderLibrary;
