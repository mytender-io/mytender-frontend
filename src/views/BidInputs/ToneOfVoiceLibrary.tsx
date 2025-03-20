import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { BidContext } from "../BidWritingStateManagerView.tsx";
import CreateToneOfVoiceDialog from "./components/CreateToneOfVoiceDialog.tsx";

interface ToneOfVoiceLibraryProps {
  selectable?: boolean;
}

const ToneOfVoiceLibrary = ({ selectable = true }: ToneOfVoiceLibraryProps) => {
  const [tones, setTones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  const { sharedState, setSharedState } = useContext(BidContext);
  const auth = useAuthUser()();
  const token = auth?.token || "default";

  // Fetch tones on component mount
  useEffect(() => {
    fetchTones();
  }, []);

  // Set initial selected tone from shared state - only on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      if (sharedState.tone_of_voice) {
        setSelectedTone(sharedState.tone_of_voice);
      }
      isInitialMount.current = false;
    }
  }, [sharedState.tone_of_voice]);

  // Update selected tone when tones are loaded - using a separate effect to avoid duplicate state updates
  useEffect(() => {
    if (
      tones.length > 0 &&
      sharedState.tone_of_voice &&
      !isInitialMount.current
    ) {
      if (tones.includes(sharedState.tone_of_voice)) {
        setSelectedTone(sharedState.tone_of_voice);
      }
    }
  }, [tones]);

  const fetchTones = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_tone_of_voice_library`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const tonesFromApi = response.data.tone_of_voice_library || [];
      setTones(tonesFromApi);

      // After setting tones, ensure the selected tone is set if it exists in the loaded tones
      if (
        sharedState.tone_of_voice &&
        tonesFromApi.includes(sharedState.tone_of_voice)
      ) {
        setSelectedTone(sharedState.tone_of_voice);
      }
    } catch (err) {
      // Use toast.error with toastId to prevent duplicate toasts
      toast.error(
        "Failed to load tone of voice library. Please try again later.",
        { toastId: "fetch-tones-error" }
      );
      console.error("Error fetching tones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneSelection = (tone: string) => {
    if (!selectable) return;

    if (selectedTone === tone) {
      setSelectedTone(null);
      setSharedState({
        ...sharedState,
        tone_of_voice: ""
      });
      // Add toastId to prevent duplicates
      toast.success("Tone of voice cleared", { toastId: "tone-cleared" });
    } else {
      setSelectedTone(tone);
      setSharedState({
        ...sharedState,
        tone_of_voice: tone
      });

      // Add toastId to prevent duplicates
      toast.success(`Tone of voice set to: ${tone}`, {
        toastId: `tone-set-${tone}`
      });
    }
  };

  const handleAddTone = (newTone: string) => {
    // Refresh the tones list to include the new tone
    fetchTones();
    // Close the dialog
    setIsDialogOpen(false);
  };

  // Function to determine if we should show the selected tone notification
  const shouldShowSelectedTone = () => {
    return selectable && selectedTone && selectedTone.trim() !== "";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg font-semibold">Tone of Voice Library</h2>
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tone Of Voice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-gray-500 italic gap-2">
          <Spinner className="w-4 h-4" />
          <span>Loading tones...</span>
        </div>
      ) : (
        <>
          {tones.length === 0 ? (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
              No tones of voice available in the library.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden mb-6">
              {/* Table wrapper with fixed height and overflow */}
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      {selectable && (
                        <TableHead className="px-4">Select</TableHead>
                      )}
                      <TableHead>Tone Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tones.map((tone) => (
                      <TableRow
                        key={tone}
                        className={
                          selectable && selectedTone === tone
                            ? "bg-blue-50"
                            : ""
                        }
                        onClick={
                          selectable
                            ? () => handleToneSelection(tone)
                            : undefined
                        }
                        style={selectable ? { cursor: "pointer" } : undefined}
                      >
                        {selectable && (
                          <TableCell className="text-center px-4">
                            <Checkbox
                              id={`tone-${tone}`}
                              checked={selectedTone === tone}
                              onCheckedChange={() => handleToneSelection(tone)}
                              className="ms-2"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {selectable ? (
                            <label
                              htmlFor={`tone-${tone}`}
                              className="cursor-pointer"
                            >
                              {tone}
                            </label>
                          ) : (
                            tone
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {shouldShowSelectedTone() && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <p>
                Currently selected tone:
                <span className="ml-2 font-semibold text-blue-700">
                  {selectedTone}
                </span>
              </p>
            </div>
          )}
        </>
      )}

      {/* Add Tone of Voice Dialog */}
      {isDialogOpen && (
        <CreateToneOfVoiceDialog
          onClose={() => setIsDialogOpen(false)}
          onAddTone={handleAddTone}
        />
      )}
    </div>
  );
};

export default ToneOfVoiceLibrary;
