import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { FolderIcon, FileIcon, ReplyIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import BreadCrumbs from "./BreadCrumbs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Updated interface for SelectFileProps to handle file metadata and API endpoint
interface SelectFileProps {
  onFileSelect: (
    files: Array<{ unique_id: string; filename: string; folder: string }>
  ) => void;
  initialSelectedFiles?: string[];
  apiEndpoint?: string; // New prop for the API endpoint
  rootFolderName?: string; // Optional prop for the root folder name display
}

const SelectFile: React.FC<SelectFileProps> = ({
  onFileSelect,
  initialSelectedFiles = [],
  apiEndpoint = "get_collections", // Default to get_collections if not specified
  rootFolderName = "Whole Content Library" // Default name for the root folder
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [availableCollections, setAvailableCollections] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFolder, setActiveFolder] = useState(null);

  // Track selected files as a state
  const [selectedFiles, setSelectedFiles] = useState(() => {
    console.log("Initializing selectedFiles with:", initialSelectedFiles);
    const initialSelection = new Set([...initialSelectedFiles]);
    return Array.from(initialSelection);
  });

  const [isLoading, setIsLoading] = useState(true);
  const [folderStructure, setFolderStructure] = useState({});
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Pagination states
  const itemsPerPage = 10;

  const getTopLevelFolders = () => {
    // For case studies, we don't exclude FORWARDSLASH if apiEndpoint is get_case_studies
    const isCaseStudies = apiEndpoint === "get_case_studies";

    if (isCaseStudies) {
      // For case studies endpoint, only include direct children of case_studies_collection
      const caseStudyFolders = availableCollections
        .filter((collection: string) => {
          const parts = collection.split("FORWARDSLASH");
          return (
            parts.length === 2 &&
            collection.startsWith("case_studies_collection")
          );
        })
        .map((collection: string) => {
          const parts = collection.split("FORWARDSLASH");
          // Return full path for navigation
          return collection;
        });

      return caseStudyFolders.sort((a: string, b: string) =>
        a.localeCompare(b)
      );
    } else {
      // Original behavior for regular collections
      const folders = availableCollections.filter(
        (collection: string) =>
          !collection.includes("FORWARDSLASH") &&
          !collection.startsWith("TenderLibrary_")
      );

      // Sort the folders to put "default" first
      return folders.sort((a: string, b: string) => {
        if (a === "default") return -1;
        if (b === "default") return 1;
        return a.localeCompare(b);
      });
    }
  };

  const fetchFolderStructure = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/${apiEndpoint}`,
        {},
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );

      // Handle different response structures based on the endpoint
      if (apiEndpoint === "get_case_studies") {
        setAvailableCollections(response.data.case_studies || []);
      } else {
        setAvailableCollections(response.data.collections || []);
      }

      // Build the folder structure regardless of the endpoint
      const structure = {};
      const collections =
        apiEndpoint === "get_case_studies"
          ? response.data.case_studies || []
          : response.data.collections || [];

      collections.forEach((collectionName) => {
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
      console.error(
        `Error fetching folder structure from ${apiEndpoint}:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderContents = async (folderPath) => {
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

      // Log folder contents for debugging
      console.log(`Folder contents for ${folderPath}:`, allContents);

      setFolderContents((prevContents) => ({
        ...prevContents,
        [folderPath]: allContents
      }));
    } catch (error) {
      console.error("Error fetching folder contents:", error);
    }
  };

  const handleFolderClick = (folderPath) => {
    setActiveFolder(folderPath);
    if (!folderContents[folderPath]) {
      fetchFolderContents(folderPath);
    }
  };

  const handleBackClick = () => {
    if (activeFolder) {
      const parts = activeFolder.split("FORWARDSLASH");
      if (parts.length > 1) {
        const parentFolder = parts.slice(0, -1).join("FORWARDSLASH");
        setActiveFolder(parentFolder);
        if (!folderContents[parentFolder]) {
          fetchFolderContents(parentFolder);
        }
      } else {
        setActiveFolder(null);
      }
    }
  };

  const handleFileSelect = (fileId: string, filename: string) => {
    // Get the current folder path - needed for tracking which folder the file belongs to
    const currentFolder = activeFolder || "default";

    console.log(
      `File selection toggled: ID=${fileId}, Name=${filename}, Folder=${currentFolder}`
    );
    console.log(`Current selectedFiles:`, selectedFiles);
    console.log(`Is file already selected? ${selectedFiles.includes(fileId)}`);

    setSelectedFiles((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
        console.log(`Removing file from selection: ${fileId}`);
      } else {
        newSelection.add(fileId);
        console.log(`Adding file to selection: ${fileId}`);
      }

      // Create file metadata objects for each selected file
      const selectedFilesWithMetadata = [];

      // Get all selected file IDs
      const selectedIds = Array.from(newSelection);
      console.log("Updated selection IDs:", selectedIds);

      // For each selected ID, find the corresponding file info across all folders
      selectedIds.forEach((id) => {
        // Look for the file in all available folder contents
        let foundFileInfo = null;
        let foundFolder = null;

        // Search in the current folder first
        if (folderContents[currentFolder]) {
          foundFileInfo = folderContents[currentFolder].find(
            (item) => item.unique_id === id && !item.isFolder
          );
          if (foundFileInfo) {
            foundFolder = currentFolder;
          }
        }

        // If not found in current folder, search in all folders
        if (!foundFileInfo) {
          Object.entries(folderContents).forEach(([folderName, contents]) => {
            const fileInfo = contents.find(
              (item) => item.unique_id === id && !item.isFolder
            );
            if (fileInfo && !foundFileInfo) {
              foundFileInfo = fileInfo;
              foundFolder = folderName;
            }
          });
        }

        // Add to the selected files metadata if found
        if (foundFileInfo && foundFolder) {
          selectedFilesWithMetadata.push({
            unique_id: id,
            filename: foundFileInfo.filename,
            folder: foundFolder
          });
        } else {
          console.warn(`Could not find file info for ID: ${id}`);
        }
      });

      console.log("Selected files with metadata:", selectedFilesWithMetadata);

      // Pass the complete file metadata to the parent
      onFileSelect(selectedFilesWithMetadata);

      return selectedIds;
    });
  };

  // Update selectedFiles when initialSelectedFiles changes
  useEffect(() => {
    console.log("initialSelectedFiles changed:", initialSelectedFiles);
    setSelectedFiles((prev) => {
      const newSelection = new Set([...initialSelectedFiles]);
      return Array.from(newSelection);
    });
  }, [initialSelectedFiles]);

  useEffect(() => {
    fetchFolderStructure();
    if (activeFolder) {
      fetchFolderContents(activeFolder);
    }
  }, [updateTrigger, activeFolder, apiEndpoint]);

  useEffect(() => {
    if (activeFolder === null) {
      const topLevelFolders = getTopLevelFolders();
      const itemsCount = topLevelFolders.length;
      const pages = Math.ceil(itemsCount / itemsPerPage);
      setTotalPages(pages);
    } else {
      const itemsCount = folderContents[activeFolder]?.length || 0;
      const pages = Math.ceil(itemsCount / itemsPerPage);
      setTotalPages(pages);
    }
  }, [
    activeFolder,
    folderContents,
    availableCollections,
    itemsPerPage,
    apiEndpoint
  ]);

  const formatDisplayName = (name) => {
    if (typeof name !== "string") return "";
    return name.replace(/_/g, " ");
  };

  // For case studies, extract just the folder name from the path
  const getDisplayName = (path) => {
    if (apiEndpoint === "get_case_studies" && path.includes("FORWARDSLASH")) {
      const parts = path.split("FORWARDSLASH");
      return formatDisplayName(parts[parts.length - 1]);
    }
    return path === "default" ? rootFolderName : formatDisplayName(path);
  };

  const getCurrentPageItems = () => {
    if (activeFolder === null) {
      const allFolders = getTopLevelFolders();
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return allFolders.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      const contents = folderContents[activeFolder] || [];
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return contents.slice(indexOfFirstItem, indexOfLastItem);
    }
  };

  const renderDirectoryContents = () => {
    const currentItems = getCurrentPageItems();

    if (activeFolder === null) {
      // Render top-level folders
      return currentItems.map((folder) => (
        <TableRow key={folder} className="hover:bg-gray-50 cursor-pointer">
          <TableCell
            className="flex items-center gap-2"
            onClick={() => handleFolderClick(folder)}
          >
            <FolderIcon className="h-4 w-4" />
            <span className="text-sm">{getDisplayName(folder)}</span>
          </TableCell>
        </TableRow>
      ));
    } else {
      // Render folder contents (both subfolders and files)
      return currentItems.map((item, index) => {
        const { filename, unique_id, isFolder } = item;
        const isSelected = selectedFiles.includes(unique_id);

        return (
          <TableRow key={`${unique_id}-${index}`} className="hover:bg-gray-50">
            <TableCell className="flex items-center gap-2">
              {isFolder ? (
                // Render folder (no checkbox)
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleFolderClick(unique_id)}
                >
                  <FolderIcon className="h-4 w-4" />
                  <span className="text-sm">{formatDisplayName(filename)}</span>
                </div>
              ) : (
                // Render file with checkbox
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={unique_id}
                    checked={isSelected}
                    onCheckedChange={() =>
                      handleFileSelect(unique_id, filename)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <label
                      htmlFor={unique_id}
                      className="text-sm cursor-pointer"
                    >
                      {formatDisplayName(filename)}
                    </label>
                  </div>
                </div>
              )}
            </TableCell>
          </TableRow>
        );
      });
    }
  };

  return (
    <Card className="h-[22.5rem] bg-white rounded-md shadow-sm p-4">
      <CardContent className="h-full p-0 overflow-y-auto">
        <div className="flex flex-col overflow-auto space-y-2">
          <div className="flex justify-between items-center mb-0 min-h-10">
            <BreadCrumbs
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              rootFolderName={
                apiEndpoint === "get_case_studies"
                  ? "Case Studies"
                  : rootFolderName
              }
            />
            {activeFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBackClick()}
                className="flex items-center"
              >
                <ReplyIcon className="inline h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between space-y-4">
              <Table>
                <TableBody>{renderDirectoryContents()}</TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectFile;
