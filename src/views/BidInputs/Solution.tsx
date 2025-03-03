import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Save } from "lucide-react";

const Solution = ({ initialData = {}, onSave, readOnly = false }) => {
  const [solution, setSolution] = useState({
    product: initialData.product || "",
    features: initialData.features || "",
    approach: initialData.approach || ""
  });

  const handleChange = (field) => (e) => {
    setSolution({ ...solution, [field]: e.target.value });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(solution);
      toast.success("Solution information saved successfully!");
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
            value={solution.product}
            onChange={handleChange("product")}
            className="w-full p-2 border rounded-md"
            rows={3}
            disabled={readOnly}
            placeholder="Describe your product or service offering..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What are some key technical features or capabilities of your
            solution?
          </label>
          <Textarea
            value={solution.features}
            onChange={handleChange("features")}
            className="w-full p-2 border rounded-md"
            rows={3}
            disabled={readOnly}
            placeholder="List key technical features and capabilities..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What makes your approach technically superior to alternatives?
          </label>
          <Textarea
            value={solution.approach}
            onChange={handleChange("approach")}
            className="w-full p-2 border rounded-md"
            rows={3}
            disabled={readOnly}
            placeholder="Explain your competitive technical advantages..."
          />
        </div>

        {!readOnly && (
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Solution
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Solution;
