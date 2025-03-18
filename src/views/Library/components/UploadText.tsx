import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import withAuth from "@/routes/withAuth";
import handleGAEvent from "@/utils/handleGAEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-toastify";

const UploadText = ({ folder, get_collections, onClose }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [text, setText] = useState("");
  const [profileName, setProfileName] = useState(folder || "default");
  const [fileName, setFileName] = useState("");
  const [textFormat, setTextFormat] = useState("plain");
  const [isUploading, setIsUploading] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);

  useEffect(() => {
    // Check if any field is either null or an empty string
    const checkFormFilled = profileName && fileName && text;
    setIsFormFilled(checkFormFilled);
  }, [profileName, fileName, text]); // React to changes in these states

  const handleTextSubmit = async () => {
    const formData = new FormData();
    setIsUploading(true);

    const trimmedProfileName = profileName.trim(); // Remove leading and trailing spaces
    const formattedProfileName = trimmedProfileName.replace(/\s+/g, "_");

    const trimmedFileName = fileName.trim(); // Remove leading and trailing spaces
    const formattedFileName = trimmedFileName.replace(/\s+/g, "_");

    formData.append("text", text);
    formData.append("filename", formattedFileName);
    formData.append("profile_name", formattedProfileName);
    formData.append("mode", textFormat);

    if (!/^[a-zA-Z0-9_-]{3,63}$/.test(formattedProfileName)) {
      toast.warning(
        "Folder name should be 3-63 characters long and contain only alphanumeric characters, underscores, or dashes"
      );
      setIsUploading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,63}$/.test(formattedFileName)) {
      toast.warning(
        "File name should be 3-63 characters long and contain only alphanumeric characters, underscores, or dashes"
      );
      setIsUploading(false);
      return;
    }

    if (text.length < 30) {
      toast.warning("Minimum input text is 30 characters");
      setIsUploading(false);
      return;
    }

    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/uploadtext/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenRef.current}` // Adding the token in the request headers
          }
        }
      );
      toast.success("Upload successful");
      onClose();
      get_collections();
      handleGAEvent("Library", "Text Upload", "Upload Text Button");
    } catch (error) {
      console.error("Error saving strategy:", error);

      if (error.response) {
        // Check for specific error status codes and messages
        if (error.response.status === 409) {
          toast.error("A file with this name already exists in this folder");
        } else if (error.response.status === 403) {
          // Handle the permission error for non-owners
          toast.error(
            error.response.data.detail ||
              "Only owners can upload to content library"
          );
        } else {
          // For any other HTTP error, try to use the server message if available
          toast.error(error.response.data.detail || "Failed to save");
        }
      } else {
        // For network errors or other issues
        toast.error(
          "Failed to save. Please check your connection and try again."
        );
      }
    } finally {
      setIsUploading(false); // Set isUploading to false when the upload ends
    }
  };
  const formatDisplayName = (name) => {
    return name.replace(/_/g, " ").replace(/FORWARDSLASH/g, "/");
  };

  // Updated function to reverse the formatting
  const reverseFormatDisplayName = (name) => {
    return name.replace(/\s+/g, "_").replace(/\//g, "FORWARDSLASH");
  };

  return (
    <div className="text-left">
      <div className="flex flex-col gap-6">
        <Input
          className="font-manrope"
          placeholder="Folder"
          value={formatDisplayName(profileName)}
          onChange={(e) =>
            setProfileName(reverseFormatDisplayName(e.target.value))
          }
          disabled={!!folder}
          maxLength={50}
        />

        <Input
          className="font-manrope"
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          maxLength={50}
        />

        <Textarea
          className="font-manrope min-h-[250px]"
          placeholder="Paste Bid Material Here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button
          variant="default"
          onClick={handleTextSubmit}
          disabled={!isFormFilled || isUploading}
          className="font-bold text-base"
        >
          {isUploading ? (
            <>
              <Spinner className="text-white" />
              Uploading...
            </>
          ) : (
            "Upload Data"
          )}
        </Button>
      </div>
    </div>
  );
};

export default withAuth(UploadText);
