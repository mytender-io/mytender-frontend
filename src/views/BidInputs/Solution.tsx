import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import { toast } from "react-toastify";
import { BidContext } from "../BidWritingStateManagerView";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const Solution = () => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const [solution, setSolution] = useState(sharedState.solution || "");
  const [loading, setLoading] = useState(false);
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");
  const editorRef = useRef<MDXEditorMethods>(null);

  const handleChange = (value: string) => {
    setSolution(value);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.getMarkdown() !== solution) {
      editorRef.current.setMarkdown(solution);
    }
  }, [solution]);

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold text-gray-hint_text">
            Solution Design
          </span>
          <Button onClick={generate_solution} disabled={loading}>
            {loading ? "Generating..." : "Generate Solution"}
          </Button>
        </div>
        <MDXEditor
          ref={editorRef}
          markdown={solution}
          onChange={handleChange}
          className="border rounded-md min-h-[500px]"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin()
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default Solution;
