import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
import { Button } from "@/components/ui/button";
import UploadPDF from "@/components/UploadPDF.tsx";
import handleGAEvent from "@/utils/handleGAEvent.tsx";
import { UploadButtonWithDropdown } from "./components/UploadButtonWithDropdown.tsx";
import FileContentModal from "./components/FileContentModal.tsx";
import EllipsisMenu from "./components/EllipsisMenu.tsx";
import LibrarySidepane from "./components/LibrarySidepane.tsx";
import PlusIcon from "@/components/icons/PlusIcon.tsx";
import {
  ArrowLeftIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  Search,
  X,
  HelpCircle,
  FileArchive
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import UploadText from "./components/UploadText.tsx";
import BreadCrumbs from "@/components/BreadCrumbs.tsx";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal.tsx";
import { toast } from "react-toastify";
import PDFViewer from "@/modals/PDFViewer.tsx";
import UploadZip from "@/components/UploadZip.tsx";
import posthog from "posthog-js";
import NewFolderModal from "./components/NewFolderModal.tsx";

const CaseStudies = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [availableCollections, setAvailableCollections] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [currentFileName, setCurrentFileName] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState("");
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    unique_id: string;
    filename: string;
  } | null>(null);
  const [uploadFolder, setUploadFolder] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState(null);

  const [folderStructure, setFolderStructure] = useState({});

  const [movingFiles, setMovingFiles] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const [updateTrigger, setUpdateTrigger] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const getTopLevelFolders = () => {
    // Extract case study folder names from the availableCollections
    const caseStudyFolders = availableCollections
      .filter((collection) => {
        // Only include direct children of case_studies_collection
        const parts = collection.split("FORWARDSLASH");
        return (
          parts.length === 2 && collection.startsWith("case_studies_collection")
        );
      })
      .map((collection) => {
        const parts = collection.split("FORWARDSLASH");
        // Return an object with both the name and the full path
        return {
          name: parts[1], // Just the folder name
          path: collection // Full path for navigation
        };
      });

    // Sort the folders alphabetically
    return caseStudyFolders.sort((a, b) => a.name.localeCompare(b.name));
  };
  const handleMenuItemClick = (action) => {
    posthog.capture("upload_document_to_case_study", { action });
    if (action === "pdf") handleOpenPDFModal();
    else if (action === "text") handleOpenTextModal();
    else if (action === "zip") handleOpenZipModal();
  };

  const handleDelete = async (folderTitle: string) => {
    console.log("Deleting folder:", folderTitle);
    setFolderToDelete("");
    deleteFolder(folderTitle, newFolderParent);

    posthog.capture("delete_folder_from_case_study", {
      deleted_folder: folderTitle,
      parent_folder: newFolderParent
    });

    setShowDeleteFolderModal(false);
  };

  const handleNewFolderClick = useCallback((parentFolder = null) => {
    setNewFolderParent(parentFolder);
    setShowNewFolderModal(true);
  }, []);

  const handleHideNewFolderModal = useCallback(() => {
    setShowNewFolderModal(false);
    setNewFolderParent(null);
  }, []);

  const handleShowPDFModal = (event, folder) => {
    event.stopPropagation();
    setUploadFolder(folder);
    setShowPDFModal(true);
  };

  const handleShowTextModal = (event, folder) => {
    event.stopPropagation();
    setUploadFolder(folder);
    setShowTextModal(true);
  };

  const handleOpenPDFModal = () => {
    setUploadFolder(activeFolder || null); // Sfet to activeFolder if available, otherwise null
    setShowPDFModal(true);
  };

  const handleOpenZipModal = () => {
    setUploadFolder(activeFolder || null); // Sfet to activeFolder if available, otherwise null
    setShowZipModal(true);
  };

  const handleOpenTextModal = () => {
    setUploadFolder(activeFolder || null); // Set to activeFolder if available, otherwise null
    setShowTextModal(true);
  };

  const fetchFolderStructure = useCallback(async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_case_studies`,
        {},
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );

      console.log(response.data);
      setAvailableCollections(response.data.case_studies);
      //console.log(response.data.collections);
      const structure = {};
      response.data.case_studies.forEach((collectionName) => {
        const parts = collectionName.split("FORWARDSLASH");
        let currentLevel = structure;
        parts.forEach((part, index) => {
          if (!currentLevel[part]) {
            currentLevel[part] = index === parts.length - 1 ? null : {};
          }
          currentLevel = currentLevel[part];
        });
      });

      setFolderStructure(structure);
    } catch (error) {
      console.error("Error fetching folder structure:", error);
    }
  }, []);

  const fetchFolderContents = useCallback(
    async (folderPath: string) => {
      try {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_folder_filenames`,
          { collection_name: folderPath },
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );

        const filesWithIds = response.data.map((item) => ({
          filename: item.filename,
          unique_id: item.unique_id,
          isFolder: false
        }));

        // Get subfolders
        const subfolders = availableCollections
          .filter((collection) =>
            collection.startsWith(folderPath + "FORWARDSLASH")
          )
          .map((collection) => {
            const parts = collection.split("FORWARDSLASH");
            return {
              filename: parts[parts.length - 1],
              unique_id: collection,
              isFolder: true
            };
          });

        const allContents = [...subfolders, ...filesWithIds];

        setFolderContents((prevContents) => ({
          ...prevContents,
          [folderPath]: allContents
        }));
      } catch (error) {
        console.error("Error fetching folder contents:", error);
      }
    },
    [availableCollections]
  );

  const handleCreateFolder = useCallback(
    async (folderName: string, parentFolder = null) => {
      try {
        const formattedFolderName = folderName.trim().replace(/\s+/g, "_");
        const formData = new FormData();
        formData.append("folder_name", formattedFolderName);
        if (parentFolder) {
          formData.append("parent_folder", parentFolder);
        }
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/create_upload_folder_case_studies`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        if (response.data.message === "Folder created successfully") {
          toast.success(
            `${parentFolder ? "Subfolder" : "Folder"} created successfully`
          );

          posthog.capture("folder_create_success", {
            folder_name: formattedFolderName,
            parent_folder: parentFolder
          });

          // Refresh the folder structure
          await fetchFolderStructure();
          // If we're creating a subfolder, refresh the contents of the parent folder
          if (parentFolder) {
            await fetchFolderContents(parentFolder);
          } else {
            // If we're creating a top-level folder, refresh the root folder contents
            setActiveFolder(null);
            await fetchFolderContents("");
          }
          setUpdateTrigger((prev) => prev + 1);
          setShowNewFolderModal(false);
        } else {
          toast.error(
            `Failed to create ${parentFolder ? "subfolder" : "folder"}`
          );

          posthog.capture("folder_create_failed", {
            folder_name: formattedFolderName,
            parent_folder: parentFolder
          });
        }
      } catch (error) {
        console.error(
          `Error creating ${parentFolder ? "subfolder" : "folder"}:`,
          error
        );
        // Extract the detailed error message from the response
        const errorMessage =
          error.response?.data?.detail ||
          `Error creating ${parentFolder ? "subfolder" : "folder"}`;
        toast.error(errorMessage);
      }
    },
    [tokenRef, fetchFolderStructure, fetchFolderContents, setActiveFolder]
  );

  const handleOnClose = () => {
    setShowPDFModal(false);
    fetchFolderStructure();
    if (uploadFolder) {
      fetchFolderContents(uploadFolder);
    }
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleOnCloseZip = () => {
    setShowZipModal(false);

    // Give the backend time to finish processing and updating
    setTimeout(async () => {
      // First refresh the folder structure to get updated collections
      await fetchFolderStructure();

      // Then refresh the contents of the current folder if we're in a folder
      if (uploadFolder) {
        await fetchFolderContents(uploadFolder);
      }

      // Trigger a full update to ensure UI reflects new content
      setUpdateTrigger((prev) => prev + 1);
    }, 1500);
  };

  const UploadPDFModal = ({
    show,
    onHide,
    folder,
    get_collections,
    onClose
  }) => (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadPDF
            folder={folder}
            get_collections={get_collections}
            onClose={onClose}
            apiUrl={`http${HTTP_PREFIX}://${API_URL}/uploadfile/`}
            descriptionText="Upload previous bids here for the AI to use as context in the Q&A Generator. This might take a while for large documents because we need to convert the documents into a format the AI can understand so sit tight!"
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const UploadZipModal = ({
    show,
    onHide,
    folder,
    get_collections,
    onClose
  }) => (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Zip Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadZip
            folder={folder}
            get_collections={get_collections}
            onClose={onClose}
            descriptionText="Upload ZIP files containing multiple documents. The system will extract and process all files in the ZIP. This might take a while for large archives as we need to convert the documents into a format the AI can understand."
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const UploadTextModal = ({ show, onHide, folder, get_collections }) => (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Text Uploader</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <UploadText
            folder={folder}
            get_collections={get_collections}
            onClose={() => {
              onHide();
              setUpdateTrigger((prev) => prev + 1);
              if (folder) {
                fetchFolderContents(folder);
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const DeleteFolderModal = ({ show, onHide, onDelete, folderTitle }) => {
    const displayFolderName = folderTitle
      .replace(/FORWARDSLASH/g, "/")
      .replace(/_/g, " ");

    return (
      <DeleteConfirmationDialog
        isOpen={show}
        onClose={onHide}
        onConfirm={() => onDelete(folderTitle)}
        title="Delete Folder"
        message={`Are you sure you want to delete the folder "${displayFolderName}"?`}
      />
    );
  };

  const DeleteFileModal = ({ show, onHide, onDelete, fileName }) => (
    <DeleteConfirmationDialog
      isOpen={show}
      onClose={onHide}
      onConfirm={() => onDelete()}
      title="Delete File"
      message={`Are you sure you want to delete the file "${fileName}"?`}
    />
  );

  const saveFileContent = async (
    id: string,
    newContent: string,
    folderName: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("id", id); // Make sure this matches your FastAPI endpoint's expected field
      formData.append("text", newContent);
      formData.append("profile_name", folderName);
      formData.append("mode", "plain");

      await axios.post(`http${HTTP_PREFIX}://${API_URL}/updatetext`, formData, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
        }
      });

      setModalContent(newContent); // Update the modal content with the new content

      posthog.capture("save_file_content_success", {
        file_id: id,
        file_text: newContent,
        profile_name: folderName
      });

      //console.log("Content updated successfully");
    } catch (error) {
      console.error("Error saving file content:", error);

      posthog.capture("save_file_content_failed", {
        file_id: id,
        file_text: newContent,
        profile_name: folderName
      });
    }
  };

  const viewFile = async (
    fileName: string,
    folderName: string,
    unique_id: string
  ) => {
    setIsLoading(true);
    setShowModal(true);
    setModalContent("");
    const formData = new FormData();
    formData.append("file_name", fileName);
    formData.append("profile_name", folderName);

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/show_file_content`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      setModalContent(response.data);
      setCurrentFileId(unique_id);
      setCurrentFileName(fileName);

      posthog.capture("view_file_success", {
        file_name: fileName,
        profile_name: folderName
      });
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error(`Error loading document`);

      posthog.capture("view_file_failed", {
        file_name: fileName,
        profile_name: folderName
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewPdfFile = async (fileName: string, folderName: string) => {
    setIsLoading(true);
    setPdfUrl("");
    setShowPdfViewerModal(true);
    const formData = new FormData();
    formData.append("file_name", fileName);
    formData.append("profile_name", folderName);

    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/show_file_content_pdf_format`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          },
          responseType: "blob"
        }
      );

      const fileURL = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      setPdfUrl(fileURL);

      posthog.capture("view_pdf_file_success", {
        file_name: fileName,
        profile_name: folderName
      });
    } catch (error) {
      console.error("Error viewing PDF file:", error);

      if (error.response && error.response.status === 404) {
        toast.error(`PDF file not found, try reuploading the pdf file`);
      }

      posthog.capture("view_pdf_file_failed", {
        file_name: fileName,
        profile_name: folderName
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (uniqueId) => {
    const formData = new FormData();
    formData.append("unique_id", uniqueId);
    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/delete_template_entry/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      handleGAEvent("Library", "Delete Document", "Delete Document Button");
      setUpdateTrigger((prev) => prev + 1);
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      // Extract the detail error message from the response
      const errorMessage =
        error.response?.data?.detail || "Error deleting document";
      toast.error(errorMessage);
    }
  };

  const deleteFolder = useCallback(
    async (folderTitle, parentFolder = null) => {
      const formData = new FormData();
      formData.append("profile_name", folderTitle);
      try {
        await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/delete_template/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        handleGAEvent("Library", "Delete Folder", "Delete Folder Button");
        setUpdateTrigger((prev) => prev + 1);
        await fetchFolderStructure();
        // If we're deleting a subfolder, refresh the contents of the parent folder
        if (parentFolder) {
          await fetchFolderContents(parentFolder);
        } else {
          // If we're deleting a top-level folder, refresh the root folder contents
          setActiveFolder(null);
          await fetchFolderContents("");
        }
        setUpdateTrigger((prev) => prev + 1);
        toast.success("Folder deleted successfully");
      } catch (error) {
        console.error("Error deleting folder:", error);
        // Extract the detail error message from the response
        const errorMessage =
          error.response?.data?.detail || "Error deleting folder";
        toast.error(errorMessage);
      }
    },
    [tokenRef, fetchFolderStructure, fetchFolderContents, setActiveFolder]
  );

  const handleFolderClick = (folderPath) => {
    //console.log(`Folder clicked: ${folderPath}`);
    setActiveFolder(folderPath);
    if (!folderContents[folderPath]) {
      //console.log(
      //  `Fetching contents for ${folderPath} as they don't exist yet`
      //);
      fetchFolderContents(folderPath);
    } else {
      console.log(
        `Contents for ${folderPath} already exist:`,
        folderContents[folderPath]
      );
    }
  };

  const handleBackClick = () => {
    if (activeFolder) {
      const parts = activeFolder.split("FORWARDSLASH");
      if (parts.length > 1) {
        // Go up one level
        const parentFolder = parts.slice(0, -1).join("FORWARDSLASH");
        setActiveFolder(parentFolder);
        if (!folderContents[parentFolder]) {
          fetchFolderContents(parentFolder);
        }
      } else {
        // If we're at the root level, go back to the main folder view
        setActiveFolder(null);
      }
    }
  };
  useEffect(() => {
    fetchFolderStructure();
    if (activeFolder) {
      fetchFolderContents(activeFolder);
    }
  }, [updateTrigger, activeFolder]);

  useEffect(() => {
    setShowDropdown(searchQuery.length > 0);
  }, [searchQuery]);

  const formatDisplayName = (name) => {
    if (typeof name !== "string") return "";
    return name.replace(/_/g, " ");
  };

  // Then modify the renderFolderStructure function to use this new format:
  const renderFolderStructure = () => {
    const topLevelFolders = getTopLevelFolders();

    return topLevelFolders.map((folder) => {
      const displayName = formatDisplayName(folder.name);
      return (
        <TableRow
          key={folder.path}
          onClick={() => handleFolderClick(folder.path)}
          className="cursor-pointer"
        >
          <TableCell className="px-4 group">
            <div className="flex items-center group-hover:text-orange">
              <FolderIcon className="h-4 w-4 mr-2.5" />
              {displayName}
            </div>
          </TableCell>
          <TableCell className="w-[100px] text-right px-4">
            <UploadButtonWithDropdown
              folder={folder.path}
              handleShowPDFModal={handleShowPDFModal}
              handleShowTextModal={handleShowTextModal}
              setShowDeleteFolderModal={setShowDeleteFolderModal}
              setFolderToDelete={setFolderToDelete}
              handleNewFolderClick={handleNewFolderClick}
            />
          </TableCell>
        </TableRow>
      );
    });
  };

  const onFileMove = async (newFolder: string, unique_id: string) => {
    try {
      setMovingFiles((prev) => ({ ...prev, [unique_id]: true }));

      const formData = new FormData();
      formData.append("unique_id", unique_id);
      formData.append("new_folder", newFolder);
      await axios.post(`http${HTTP_PREFIX}://${API_URL}/move_file`, formData, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          "Content-Type": "multipart/form-data"
        }
      });
      await fetchFolderContents(activeFolder);

      posthog.capture("file_moved", {
        unique_id,
        destination_folder: newFolder,
        timestamp: new Date().toISOString()
      });

      toast.success("File moved successfully");
    } catch (error) {
      console.error("Error moving file:", error);
      const errorMessage = error.response?.data?.detail || "Error moving file";

      posthog.capture("file_move_failed", {
        unique_id,
        destination_folder: newFolder,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      toast.error(errorMessage);
    } finally {
      setMovingFiles((prev) => ({ ...prev, [unique_id]: false }));
    }
  };

  const onFileDelete = () => {
    posthog.capture("delete_file_from_content_library", {
      unique_id: fileToDelete?.unique_id,
      filename: fileToDelete?.filename
    });
    deleteDocument(fileToDelete?.unique_id);
    setShowDeleteFileModal(false);
  };

  const renderFolderContents = (folderPath) => {
    //console.log("Rendering contents for folder:", folderPath);
    const contents = folderContents[folderPath] || [];
    //console.log("Raw contents:", contents);

    // Filter to only show direct children
    const directChildren = contents.filter(({ unique_id, isFolder }) => {
      //console.log("\nChecking item:", unique_id);

      if (!isFolder) return true; // Files are always direct children

      // Get the relative path by removing the current folder path
      const relativePath = unique_id.replace(folderPath + "FORWARDSLASH", "");
      //console.log("Relative path:", relativePath);

      // Count how many FORWARDSLASH are in the relative path
      const forwardSlashCount = (relativePath.match(/FORWARDSLASH/g) || [])
        .length;
      //console.log("Forward slash count:", forwardSlashCount);

      // A direct child should have no additional FORWARDSLASH in its relative path
      const isDirectChild = forwardSlashCount === 0;
      //onsole.log("Is direct child?", isDirectChild);

      return isDirectChild;
    });

    //console.log("Filtered direct children:", directChildren);

    return directChildren.map(({ filename, unique_id, isFolder }, index) => {
      const fullPath = isFolder
        ? `${folderPath}FORWARDSLASH${filename}`
        : folderPath;
      const displayName = formatDisplayName(filename);

      return (
        <TableRow
          key={`${folderPath}-${index}`}
          className="cursor-pointer"
          // onContextMenu={(e) =>
          //   handleContextMenu(e, isFolder, unique_id, fullPath)
          // }
        >
          <TableCell
            className="px-4"
            onClick={() =>
              isFolder
                ? handleFolderClick(fullPath)
                : viewFile(filename, folderPath, unique_id)
            }
          >
            <div className="flex items-center">
              {isFolder ? (
                <FolderIcon className="h-4 w-4 mr-2.5" />
              ) : (
                <FileIcon className="h-4 w-4 mr-2.5" />
              )}
              {displayName}
            </div>
          </TableCell>
          <TableCell className="w-[100px] text-right px-4">
            {isFolder ? (
              <UploadButtonWithDropdown
                folder={fullPath}
                handleShowPDFModal={handleShowPDFModal}
                handleShowTextModal={handleShowTextModal}
                setShowDeleteFolderModal={setShowDeleteFolderModal}
                setFolderToDelete={setFolderToDelete}
                handleNewFolderClick={handleNewFolderClick}
              />
            ) : (
              <EllipsisMenu
                filename={filename}
                unique_id={unique_id}
                onDelete={() => {
                  setFileToDelete({
                    unique_id: unique_id,
                    filename: filename
                  });
                  setShowDeleteFileModal(true);
                }}
                availableFolders={availableCollections}
                currentFolder={activeFolder}
                isMoving={movingFiles[unique_id]}
                onMove={(newFolder: string) => onFileMove(newFolder, unique_id)}
              />
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.length > 0) {
      // Filter folder matches
      const folderMatches = availableCollections
        .filter((collection) => collection.toLowerCase().includes(query))
        .map((collection) => {
          // Extract just the relevant part of the path (remove case_studies_collection prefix)
          const parts = collection.split("FORWARDSLASH");
          const displayParts = parts.slice(1); // Skip the first part (case_studies_collection)

          return {
            name: parts[parts.length - 1],
            type: "folder",
            path: collection,
            // Create a clean display path without the case_studies_collection prefix
            fullName: displayParts.join("/")
          };
        });

      // Filter file matches
      const fileMatches = Object.entries(folderContents).flatMap(
        ([folder, contents]) =>
          contents
            .filter((item) => item.filename.toLowerCase().includes(query))
            .map((item) => {
              // Extract folder parts to create cleaner display path
              const folderParts = folder.split("FORWARDSLASH");
              const displayFolderParts = folderParts.slice(1); // Skip case_studies_collection
              const displayFolder = displayFolderParts.join("/");

              return {
                name: item.filename,
                type: item.isFolder ? "folder" : "file",
                path: folder,
                // Show cleaner path without case_studies_collection prefix
                fullName: displayFolder
                  ? `${displayFolder}/${item.filename}`
                  : item.filename,
                unique_id: item.unique_id
              };
            })
      );

      const results = [...folderMatches, ...fileMatches];
      setFilteredResults(results);
      setShowSearchResults(true);
    } else {
      setFilteredResults([]);
      setShowSearchResults(false);
    }
  };
  const handleSearchResultClick = async (result) => {
    if (result.type === "folder") {
      setActiveFolder(result.path);
      setCurrentPage(1);
      if (
        !folderContents[result.path] ||
        folderContents[result.path].length === 0
      ) {
        await fetchFolderContents(result.path);
      }
    } else if (result.type === "file") {
      setActiveFolder(result.path);
      setCurrentPage(1);

      if (
        !folderContents[result.path] ||
        folderContents[result.path].length === 0
      ) {
        await fetchFolderContents(result.path);
      }

      // Wait for state to update
      setTimeout(() => {
        viewFile(result.name, result.path, result.unique_id);
      }, 100);
    }

    // Clear search query immediately
    setSearchQuery("");

    // Delay hiding the dropdown and search results
    setTimeout(() => {
      setShowSearchResults(false);
      setShowDropdown(false);
    }, 200);
  };

  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    return (
      <div className="absolute top-[calc(100%+4px)] left-0 w-full max-h-[14rem] overflow-y-auto rounded-xl border bg-background shadow-lg z-10">
        {filteredResults.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            No results found...
          </div>
        ) : (
          filteredResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted cursor-pointer"
              onClick={() => handleSearchResultClick(result)}
            >
              {result.type === "file" ? (
                <FileIcon className="h-4 w-4" />
              ) : (
                <FolderIcon className="h-4 w-4" />
              )}
              <span>
                {result.type === "file"
                  ? `${result.name} (in ${result.fullName.split("/").slice(0, -1).join("/")})`
                  : result.fullName}
              </span>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="h-full flex gap-6 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col flex-1 space-y-6 py-4 pl-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="block text-2xl font-semibold">
                  Build your knowledge base
                </span>
                <span className="block text-base text-muted-foreground">
                  Upload documents in PDF, word or excel so responses are
                  grounded in your information.
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="relative w-full max-w-96">
                  <div className="relative flex items-center w-full px-4 py-2 border border-typo-grey-6 rounded-lg bg-white">
                    <Search className="absolute left-4 h-6 w-6 text-typo-700 z-10" />
                    <Input
                      className="w-full pl-9 border-none outline-none focus-visible:ring-0 shadow-none text-base md:text-base py-0 h-6"
                      placeholder="Search folders and files"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        setShowDropdown(true);
                        setShowSearchResults(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowDropdown(false);
                          setShowSearchResults(false);
                        }, 200);
                      }}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => {
                          setSearchQuery("");
                          setShowDropdown(false);
                          setShowSearchResults(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {showSearchResults && renderSearchResults()}
                </div>
                {!activeFolder ? (
                  <Button
                    size="lg"
                    className="px-4"
                    onClick={() => handleNewFolderClick(null)}
                  >
                    <PlusIcon className="text-white mr-2" />
                    New Folder
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="lg" className="px-4">
                        <PlusIcon className="text-white mr-2" />
                        Upload
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem
                        onClick={() => handleMenuItemClick("pdf")}
                      >
                        <FileIcon className="h-4 w-4 mr-2" />
                        Upload PDF/Word/Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMenuItemClick("text")}
                      >
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Upload Text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMenuItemClick("zip")}
                      >
                        <FileArchive className="h-4 w-4 mr-2" />
                        Upload Zip Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleNewFolderClick(activeFolder)}
                      >
                        <FolderIcon className="h-4 w-4 mr-2" />
                        New Subfolder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto border rounded-lg">
              <div>
                <div className="flex items-center p-4 border-b max-h-12">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <BreadCrumbs
                        activeFolder={activeFolder}
                        setActiveFolder={setActiveFolder}
                        rootFolderName="Case Studies"
                      />
                    </div>
                    {activeFolder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBackClick()}
                        className="flex items-center"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Table>
                    <TableBody>
                      {activeFolder
                        ? renderFolderContents(activeFolder)
                        : renderFolderStructure()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Modals */}
            <FileContentModal
              showModal={showModal}
              setShowModal={setShowModal}
              modalContent={modalContent}
              onSave={(newContent) =>
                saveFileContent(currentFileId, newContent, activeFolder)
              }
              documentId={currentFileId}
              fileName={currentFileName}
              folderName={activeFolder}
              onViewPdf={viewPdfFile}
              isLoading={isLoading}
            />

            <DeleteFolderModal
              show={showDeleteFolderModal}
              onHide={() => setShowDeleteFolderModal(false)}
              onDelete={() => handleDelete(folderToDelete)}
              folderTitle={folderToDelete}
            />

            <DeleteFileModal
              show={showDeleteFileModal}
              onHide={() => setShowDeleteFileModal(false)}
              onDelete={onFileDelete}
              fileName={fileToDelete ? fileToDelete.filename : ""}
            />

            <UploadPDFModal
              show={showPDFModal}
              onHide={() => setShowPDFModal(false)}
              folder={uploadFolder}
              get_collections={fetchFolderStructure}
              onClose={handleOnClose}
            />

            <UploadZipModal
              show={showZipModal}
              onHide={() => setShowZipModal(false)}
              folder={uploadFolder}
              get_collections={fetchFolderStructure}
              onClose={handleOnCloseZip}
            />

            <UploadTextModal
              show={showTextModal}
              onHide={() => setShowTextModal(false)}
              folder={uploadFolder}
              get_collections={fetchFolderStructure}
            />

            <NewFolderModal
              show={showNewFolderModal}
              onHide={handleHideNewFolderModal}
              onCreateFolder={handleCreateFolder}
              title={
                newFolderParent ? "Create New Subfolder" : "Create New Folder"
              }
              parentFolder={newFolderParent}
            />

            {showPdfViewerModal && (
              <PDFViewer
                pdfUrl={pdfUrl}
                isLoading={isLoading}
                onClose={() => setShowPdfViewerModal(false)}
              />
            )}
          </div>
          <LibrarySidepane />
        </div>
      </div>
    </div>
  );
};

export default withAuth(CaseStudies);

