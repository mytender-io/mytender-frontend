import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
// import withAuth from "../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import {
  faFolder,
  faFileAlt,
  faReply
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import BreadCrumbs from "./BreadCrumbs";

const SelectFolder = ({ onFolderSelect, initialSelectedFolders = [] }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [availableCollections, setAvailableCollections] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFolder, setActiveFolder] = useState(null);
  const [selectedFolders, setSelectedFolders] = useState(() => {
    const initialSelection = new Set([...initialSelectedFolders, "default"]);
    return Array.from(initialSelection);
  });
  const [isLoading, setIsLoading] = useState(true);

  const [folderStructure, setFolderStructure] = useState({});

  const [updateTrigger, setUpdateTrigger] = useState(0);

  const getTopLevelFolders = () => {
    const folders = availableCollections.filter(
      (collection) =>
        !collection.includes("FORWARDSLASH") &&
        !collection.startsWith("TenderLibrary_")
    );

    // Sort the folders to put "default" first
    return folders.sort((a, b) => {
      if (a === "default") return -1;
      if (b === "default") return 1;
      return a.localeCompare(b);
    });
  };

  const fetchFolderStructure = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_collections`,
        {},
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );

      //console.log(response.data);
      setAvailableCollections(response.data.collections);
      //console.log(response.data.collections);
      const structure = {};
      response.data.collections.forEach((collectionName) => {
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
    } finally {
      setIsLoading(false); // Set loading to false after fetching, whether successful or not
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

  const handleFolderSelect = (folderPath) => {
    setSelectedFolders((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(folderPath)) {
        newSelection.delete(folderPath);
      } else {
        newSelection.add(folderPath);
      }
      const newSelectionArray = Array.from(newSelection);
      onFolderSelect(newSelectionArray);
      return newSelectionArray;
    });
  };

  useEffect(() => {
    setSelectedFolders((prev) => {
      const newSelection = new Set([...initialSelectedFolders]);
      return Array.from(newSelection);
    });
  }, [initialSelectedFolders]);

  useEffect(() => {
    fetchFolderStructure();
    if (activeFolder) {
      fetchFolderContents(activeFolder);
    }
  }, [updateTrigger, activeFolder]);

  useEffect(() => {
    if (activeFolder === null) {
      const topLevelFolders = getTopLevelFolders();
      const itemsCount = topLevelFolders.length;
      const pages = Math.ceil(itemsCount);
      setTotalPages(pages);
      setCurrentPage(1);
    } else {
      const itemsCount = folderContents[activeFolder]?.length || 0;
      const pages = Math.ceil(itemsCount);
      setTotalPages(pages);
      setCurrentPage(1);
    }
  }, [activeFolder, folderContents, availableCollections]);

  const formatDisplayName = (name) => {
    if (typeof name !== "string") return "";
    return name.replace(/_/g, " ");
  };

  const renderFolderStructure = () => {
    const topLevelFolders = getTopLevelFolders();
    const foldersToRender = topLevelFolders;

    return foldersToRender.map((folderName) => {
      const displayName =
        folderName === "default"
          ? "Whole Content Library"
          : formatDisplayName(folderName);
      return (
        <TableRow key={folderName}>
          <TableCell className="flex items-center gap-4">
            <Checkbox
              checked={selectedFolders.includes(folderName)}
              onCheckedChange={() => handleFolderSelect(folderName)}
            />
            <div
              className="flex items-center gap-2"
              onClick={() => handleFolderClick(folderName)}
            >
              <FontAwesomeIcon icon={faFolder} className="h-4 w-4" />
              <span className="text-sm">{displayName}</span>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderFolderContents = (folderPath) => {
    const contents = folderContents[folderPath] || [];
    //console.log("Raw contents:", contents);

    // Filter to only show direct children
    const directChildren = contents.filter(({ unique_id, isFolder }) => {
      console.log("\nChecking item:", unique_id);

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
          className="cursor-pointer hover:bg-gray-100"
        >
          <TableCell className="flex items-center gap-4">
            {isFolder && (
              <Checkbox
                checked={selectedFolders.includes(fullPath)}
                onCheckedChange={() => handleFolderSelect(fullPath)}
              />
            )}
            <div
              className="flex items-center gap-2"
              onClick={() => isFolder && handleFolderClick(fullPath)}
            >
              <FontAwesomeIcon
                icon={isFolder ? faFolder : faFileAlt}
                className="h-4 w-4"
              />
              <span className="text-sm">{displayName}</span>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Card className="h-[22.5rem] bg-white rounded-md shadow-sm p-4">
      <CardContent className="h-full p-0">
        <div className="flex flex-col overflow-auto">
          <div className="flex justify-between items-center mb-0">
            <div className="text-left mb-1.5">
              <BreadCrumbs
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
              />
            </div>
            {activeFolder && (
              <div
                className="cursor-pointer px-2.5 py-1.5 rounded-md text-lg hover:bg-gray-100"
                onClick={() => handleBackClick()}
              >
                <FontAwesomeIcon icon={faReply} fontSize="16" />
                <span className="text-sm ml-2.5">Back</span>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableBody>
                {activeFolder
                  ? renderFolderContents(activeFolder)
                  : renderFolderStructure(folderStructure)}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectFolder;
