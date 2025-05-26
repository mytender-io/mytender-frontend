import { useContext, useState } from "react";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import TenderLibrary from "../../components/TenderLibrary";
import TenderAnalysis from "./components/TenderAnalysis";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DocsIcon from "@/components/icons/DocsIcon";

const BidPlanner = ({
  activeSubTab,
  setActiveSubTab
}: {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}) => {
  const { sharedState } = useContext(BidContext);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const { object_id } = sharedState;
  const handleOpenLibrary = () => setIsLibraryOpen(true);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 px-6 py-4">
      <Button
        onClick={handleOpenLibrary}
        variant="outline"
        className="w-fit justify-start border-gray-spacer_light ml-auto"
      >
        <div className="flex items-center space-x-3">
          <DocsIcon className="text-gray" />
          <span className="text-gray-hint_text font-medium">
            View Tender Docs
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

      <div className="flex-1">
        <TenderAnalysis
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      </div>
    </div>
  );
};

export default withAuth(BidPlanner);
