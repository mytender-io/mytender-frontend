
import TenderAnalysis from "./components/TenderAnalysis";

const BidPlanner = ({
  activeSubTab,
  setActiveSubTab
}: {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}) => {

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 px-6 py-4">

      <div className="flex-1">
        <TenderAnalysis
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      </div>
    </div>
  );
};

export default BidPlanner;
