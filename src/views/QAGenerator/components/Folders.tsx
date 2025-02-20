import React, { useEffect } from "react";
import { FolderPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { Button } from "@/components/ui/button";

const FolderLogic = ({
  tokenRef,
  setAvailableCollections,
  setFolderContents,
  availableCollections,
  folderContents
}) => {
  const get_collections = () => {
    axios
      .post(
        `http${HTTP_PREFIX}://${API_URL}/get_collections`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      )
      .then((res) => {
        setAvailableCollections(res.data.collections || []);
      })
      .catch((error) => {
        console.error("Error fetching collections:", error);
      });
  };

  useEffect(() => {
    get_collections();
  }, []);

  const addNewFolder = async (folderName) => {
    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/add_folder`,
        { folder_name: folderName },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      get_collections(); // Refresh the list of collections
    } catch (error) {
      console.error("Error adding new folder:", error);
    }
  };

  const handleAddNewFolderClick = () => {
    const newFolderName = window.prompt("Enter the name for the new folder:");
    if (newFolderName) {
      addNewFolder(newFolderName);
    }
  };

  const fetchFolderFilenames = async (folderName) => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_folder_filenames`,
        { collection_name: folderName },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );

      setFolderContents({ ...folderContents, [folderName]: response.data });
    } catch (error) {
      console.error("Error fetching folder filenames:", error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {availableCollections.map((collection, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 p-4 hover:bg-accent"
                onClick={() => fetchFolderFilenames(collection)}
              >
                <FolderPlus className="h-4 w-4" />
                <span>{collection}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {Array.isArray(folderContents[collection])
                ? folderContents[collection].join("\n")
                : ""}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <Button
        variant="outline"
        className="w-full flex items-center gap-2 p-4"
        onClick={handleAddNewFolderClick}
      >
        <span>Add Folder</span>
      </Button>
    </div>
  );
};

export default FolderLogic;
