import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { Loader2, Plus } from "lucide-react";
import { BidContext } from "../BidWritingStateManagerView.tsx";
import CreateToneOfVoiceDialog from "./components/CreateToneOfVoiceDialog.tsx";

const ToneOfVoiceLibrary = () => {
  const [tones, setTones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { sharedState, setSharedState } = useContext(BidContext);
  const auth = useAuthUser()();
  const token = auth?.token || "default";

  // Fetch tones on component mount
  useEffect(() => {
    fetchTones();
  }, []);

  // Set initial selected tone from shared state
  useEffect(() => {
    // Initialize from shared state if available
    if (sharedState.tone_of_voice) {
      setSelectedTone(sharedState.tone_of_voice);
    }
  }, []);

  // Update selected tone when tones are loaded or shared state changes
  useEffect(() => {
    if (tones.length > 0 && sharedState.tone_of_voice) {
      if (tones.includes(sharedState.tone_of_voice)) {
        setSelectedTone(sharedState.tone_of_voice);
      }
    }
  }, [tones, sharedState.tone_of_voice]);

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
      toast.error(
        "Failed to load tone of voice library. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000
        }
      );
      console.error("Error fetching tones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneSelection = (tone: string) => {
    if (selectedTone === tone) {
      setSelectedTone(null);
      setSharedState({
        ...sharedState,
        tone_of_voice: ""
      });
      toast.success("Tone of voice cleared", {
        position: "top-right",
        autoClose: 3000
      });
    } else {
      setSelectedTone(tone);
      setSharedState({
        ...sharedState,
        tone_of_voice: tone
      });

      toast.success(`Tone of voice set to: ${tone}`, {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const handleAddTone = (newTone: string) => {
    // Refresh the tones list to include the new tone
    fetchTones();
    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Select a tone of voice for the bid
        </h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tone Of Voice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-gray-500 italic">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 ">Select</TableHead>
                    <TableHead>Tone Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tones.map((tone) => (
                    <TableRow
                      key={tone}
                      className={selectedTone === tone ? "bg-blue-50" : ""}
                    >
                      <TableCell className="text-center px-4">
                        <Checkbox
                          id={`tone-${tone}`}
                          checked={selectedTone === tone}
                          onCheckedChange={() => handleToneSelection(tone)}
                          className="ms-2"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <label
                          htmlFor={`tone-${tone}`}
                          className="cursor-pointer"
                        >
                          {tone}
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTone && (
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

      <ToastContainer />
    </div>
  );
};

export default ToneOfVoiceLibrary;
