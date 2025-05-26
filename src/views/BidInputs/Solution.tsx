import React, { useContext, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import { toast } from "react-toastify";
import { BidContext } from "../BidWritingStateManagerView";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";

const Solution = ({}) => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const [solution, setSolution] = useState(sharedState.solution || "");
  const [loading, setLoading] = useState(false);
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  const handleChange = (e) => {
    setSolution(e.target.value);
  };

  const generate_solution = async () => {
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
        `http${HTTP_PREFIX}://${API_URL}/write_solution`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      // The response now contains documents with name, folder, and rawtext
      const { solution, message } = response.data;

      if (!solution || solution.length === 0) {
        toast.info(message || "No failed to write solution");
        return;
      }

      setSolution(solution);

      // Update the shared state
      setSharedState((prev) => ({
        ...prev,
        solution: solution
      }));

      toast.success(message || `Generate solution successfully!`);
    } catch (error) {
      console.error("Error writing solution:", error);
      toast.error("Failed to write solution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white border-none shadow-none">
      <CardContent className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What specific product or service are you bidding to provide?
          </label>
          <Textarea
            value={solution}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={30}
            placeholder="Describe your product or service offering..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={generate_solution} disabled={loading}>
            {loading ? "Generating..." : "Generate Solution"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Solution;
