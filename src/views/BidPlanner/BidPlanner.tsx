import { useContext, useState } from "react";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import TenderLibrary from "../../components/TenderLibrary";
import TenderAnalysis from "./components/TenderAnalysis";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExpandIcon from "@/components/icons/ExpandIcon";

const BidPlanner = () => {
  const { sharedState } = useContext(BidContext);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const { object_id} = sharedState;
  const handleOpenLibrary = () => setIsLibraryOpen(true);

  return (
    <>
      <Button
        onClick={handleOpenLibrary}
        variant="outline"
        className="w-full justify-start border-gray-spacer_light"
      >
        <div className="flex items-center space-x-3">
          <ExpandIcon className="text-gray" />
          <span className="text-gray-hint_text font-medium">
            View Tender Library Documents
          </span>
        </div>
      </Button>

      {/* Library Modal */}
      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-7xl p-2">
          <DialogTitle className="p-4">Tender Upload</DialogTitle>
          <TenderLibrary key={object_id} object_id={object_id} />
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto w-full flex-1">
        <TenderAnalysis />
      </div>
    </>
  );
};

export default withAuth(BidPlanner);
