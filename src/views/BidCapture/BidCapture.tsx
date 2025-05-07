import React, { useState, useEffect } from "react";
import withAuth from "@/routes/withAuth";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon";
import SearchInput from "@/components/SearchInput";
import KanbanBoard from "./components/KanbanBoard";

interface BidOpportunity {
  _id: string;
  title: string;
  description: string;
  value: string;
  deadline: string;
  source: string;
  category: string;
  status: "Interested" | "Preparing" | "Awaiting Decision" | "Won" | "Lost";
  timestamp: string;
}

const BidCapture = () => {
  const [opportunities, setOpportunities] = useState<BidOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoint when implemented
      // Commented out until API endpoint is available
      // const response = await axios.get(`${API_URL}/api/bid-opportunities`, {
      //   headers: { Authorization: `Bearer ${auth?.token}` }
      // });

      // Temporary mock data until backend is implemented
      const mockData: BidOpportunity[] = [
        {
          _id: "1",
          title: "Defense Supply Center Building 31M Break Room Renovation",
          description: "Renovation services for the break room at building 31M",
          value: "$90K",
          deadline: "2023-12-15",
          source: "GovDash",
          category: "Construction",
          status: "Interested",
          timestamp: new Date().toISOString()
        },
        {
          _id: "2",
          title: "Women's Entrepreneurship Summit Production Management",
          description:
            "Production management services for the Women's Entrepreneurship Summit",
          value: "$150K",
          deadline: "2025-05-15",
          source: "GovDash",
          category: "Event Management",
          status: "Preparing",
          timestamp: new Date().toISOString()
        },
        {
          _id: "3",
          title: "Council of University Transportation Centers Awards Ceremony",
          description:
            "Event coordination services for the CUTC Awards Ceremony",
          value: "$250K",
          deadline: "2023-12-25",
          source: "GovDash",
          category: "Event Management",
          status: "Awaiting Decision",
          timestamp: new Date().toISOString()
        }
      ];

      // Use mock data for now
      setOpportunities(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bid opportunities:", error);
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewOpportunity = () => {
    // Implement new opportunity creation logic
    // This would typically open a modal for adding a new opportunity
    console.log("Add new opportunity");
  };

  const handleStatusChange = async (
    id: string,
    newStatus: BidOpportunity["status"]
  ) => {
    try {
      // Replace with actual API endpoint when implemented
      // await axios.patch(`${API_URL}/api/bid-opportunities/${id}`,
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${auth?.token}` } }
      // );

      // For now, update the local state
      const updatedOpportunities = opportunities.map((opp) =>
        opp._id === id ? { ...opp, status: newStatus } : opp
      );
      setOpportunities(updatedOpportunities);
    } catch (error) {
      console.error("Error updating opportunity status:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage="Bid Capture"
          rightContent={
            <SearchInput
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={handleSearch}
            />
          }
        />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bid Capture Pipeline</h1>
          <Button onClick={handleNewOpportunity}>
            <PlusIcon />
            New Opportunity
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading opportunities...</div>
        ) : (
          <KanbanBoard
            opportunities={filteredOpportunities}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(BidCapture);
