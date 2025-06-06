import React, { useState, useContext, useRef, useMemo } from "react";
import { FileIcon, XIcon, PlusIcon } from "lucide-react";
import { toast } from "react-toastify";
import {
  BidContext,
  HighlightedDocument
} from "../BidWritingStateManagerView.tsx";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { Badge } from "@/components/ui/badge";
import SelectCaseStudyPopup from "./components/SelectCaseStudyPopup.tsx";
import { Card, CardContent } from "@/components/ui/card";
import SearchIcon from "@/components/icons/SearchIcon.tsx";
import { Button } from "@/components/ui/button.tsx";

const SelectCaseStudy = ({}) => {
  // Get shared state
  const { sharedState, setSharedState } = useContext(BidContext);

  // Dialog state
  const [open, setOpen] = useState(false);

  const [highlightedDocuments, setHighlightedDocuments] = useState<
    HighlightedDocument[]
  >(() => {
    // Ensure we're getting the correct highlighted documents for this specific section
    return sharedState.selectedCaseStudies || [];
  });

  const selectedFileNames = useMemo(() => {
    return highlightedDocuments.map((doc) => doc.name);
  }, [highlightedDocuments]);

  // For tracking loading states of document content fetching
  const [loadingDocuments, setLoadingDocuments] = useState({});
  const [loading, setLoading] = useState(false);

  // Get auth token
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  // Function to fetch file content - using the approach from ProposalSidepane
  const getFileContent = async (fileName, folderName) => {
    // Set loading state for this specific document
    setLoadingDocuments((prev) => ({ ...prev, [fileName]: true }));

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

      console.log(`Content fetched for ${fileName}`);
      return response.data; // Return the content
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error(`Error retrieving content for ${fileName}`);
      return ""; // Return empty string on error
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [fileName]: false }));
    }
  };

  const handleSaveSelectedFiles = async (selectedFilesWithMetadata) => {
    console.log("Received files with metadata:", selectedFilesWithMetadata);

    if (!selectedFilesWithMetadata || selectedFilesWithMetadata.length === 0) {
      console.log("No files selected, keeping existing documents");
      return;
    }

    // Convert to HighlightedDocument objects with the correct rawtext
    const documentObjects: HighlightedDocument[] = await Promise.all(
      selectedFilesWithMetadata.map(async (file) => {
        // If existing document has rawtext, use it; otherwise, fetch the content
        const rawtext = await getFileContent(file.filename, file.folder);

        return {
          name: file.filename,
          folder: file.folder,
          rawtext: rawtext
        };
      })
    );

    // Update the state and section with the new document objects
    setHighlightedDocuments(documentObjects);

    // Update the shared state's selectedCaseStudies
    setSharedState((prev) => ({
      ...prev,
      selectedCaseStudies: documentObjects
    }));
  };

  // Function to handle deleting a case study
  const handleDeleteCaseStudy = (documentName: string) => {
    // Filter out the document with the matching name
    const updatedDocuments = highlightedDocuments.filter(
      (doc) => doc.name !== documentName
    );

    // Update local state
    setHighlightedDocuments(updatedDocuments);

    // Update shared state
    setSharedState((prev) => ({
      ...prev,
      selectedCaseStudies: updatedDocuments
    }));

    toast.success(`Removed "${documentName}" from case studies`);
  };

  const getMostRelevantCaseStudies = async () => {
    setLoading(true);
    try {
      // Check if bid_id exists in shared state
      if (!sharedState.object_id) {
        toast.error("Bid ID not found in state");
        return;
      }

      const formData = new FormData();
      formData.append("bid_id", sharedState.object_id);

      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_most_relevant_case_studies`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      // The response now contains documents with name, folder, and rawtext
      const { documents, message } = response.data;

      if (!documents || documents.length === 0) {
        toast.info(
          message ||
            "No relevant case studies found, upload some to the Case Studies folder in the Library"
        );
        return;
      }

      // Update the highlighted documents state with the returned documents
      setHighlightedDocuments(documents);

      // Update the shared state
      setSharedState((prev) => ({
        ...prev,
        selectedCaseStudies: documents
      }));

      toast.success(
        message || `Found ${documents.length} relevant case studies`
      );
    } catch (error) {
      console.error("Error getting relevant case studies:", error);
      toast.error("Failed to retrieve relevant case studies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Case Studies</h2>
        <Button
          onClick={getMostRelevantCaseStudies}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <SearchIcon className="h-4 w-4" />
          {loading ? "Finding..." : "Find Relevant Case Studies"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {/* Existing case studies */}
        {highlightedDocuments.map((doc, idx) => (
          <Card key={idx} className="relative group">
            <button
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100"
              onClick={() => handleDeleteCaseStudy(doc.name)}
              title="Remove case study"
            >
              <XIcon className="h-4 w-4 text-red-500" />
            </button>
            <CardContent className="flex flex-col items-center justify-center p-6 h-48">
              <FileIcon className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-center font-medium truncate w-full">
                {doc.name}
              </p>
              {loadingDocuments[doc.name] && (
                <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                  Loading...
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add new case study card */}
        <Card
          className="border-dashed cursor-pointer hover:border-primary transition-colors"
          onClick={() => setOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 h-48">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <PlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-center text-gray-500 font-medium">
              Add Case Study
            </p>
          </CardContent>
        </Card>
      </div>

      <SelectCaseStudyPopup
        onSaveSelectedFiles={handleSaveSelectedFiles}
        initialSelectedFiles={selectedFileNames}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default SelectCaseStudy;
