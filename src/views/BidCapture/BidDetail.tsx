import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import withAuth from "@/routes/withAuth";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  details?: {
    solicitation_number?: string;
    agency?: string;
    place_of_performance?: string;
    naics_code?: string;
    psc_code?: string;
    set_aside?: string;
    contact_info?: string;
  };
}

const BidDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<BidOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoint when implemented
      // const response = await axios.get(`${API_URL}/api/bid-opportunities/${id}`, {
      //   headers: { Authorization: `Bearer ${auth?.token}` }
      // });

      // For now, use mock data
      const mockData: BidOpportunity = {
        _id: id || "2",
        title: "Women's Entrepreneurship Summit Production Management",
        description:
          "Production management services for the Women's Entrepreneurship Summit. This contract is for the overall production management of the event, including coordination with speakers, exhibitors, and attendees.",
        value: "$150K",
        deadline: "2025-05-15",
        source: "GovDash",
        category: "Event Management",
        status: "Preparing",
        timestamp: new Date().toISOString(),
        details: {
          solicitation_number: "733510250Z17",
          agency: "SMALL BUSINESS ADMINISTRATION",
          place_of_performance: "WASH DC, USA",
          naics_code: "541922 - Convention and Trade Show Organizers",
          psc_code: "R499 - Other Professional Services",
          set_aside:
            "SBA Certified Women-Owned Small Business (WOSB) Program Set-Aside (FAR 19.15)",
          contact_info: "John Smith, john.smith@sba.gov, (202) 555-1234"
        }
      };

      setOpportunity(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching opportunity details:", error);
      setLoading(false);
    }
  };

  const handleAddToTender = () => {
    // Logic to convert opportunity to a tender in the system
    navigate("/bids"); // Navigate to tender dashboard after conversion
  };

  const handleStatusChange = async (newStatus: BidOpportunity["status"]) => {
    try {
      // Replace with actual API endpoint when implemented
      // await axios.patch(`${API_URL}/api/bid-opportunities/${id}`,
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${auth?.token}` } }
      // );

      // For now, update the local state
      if (opportunity) {
        setOpportunity({
          ...opportunity,
          status: newStatus
        });
      }
    } catch (error) {
      console.error("Error updating opportunity status:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">Loading opportunity details...</div>
    );
  }

  if (!opportunity) {
    return <div className="text-center py-10">Opportunity not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage={opportunity.title}
          parentPages={[{ name: "Bid Capture", path: "/bid-capture" }]}
        />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="flex space-x-3 justify-end">
          <Button variant="outline" onClick={() => navigate("/bid-capture")}>
            Back to Pipeline
          </Button>
          <Button onClick={handleAddToTender}>Add to Tenders</Button>
        </div>
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div className="col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {opportunity.title}
                    </CardTitle>
                    <p className="text-gray-500 mt-2">
                      {opportunity.description}
                    </p>
                  </div>
                  <Badge
                    className={`
                  ${opportunity.status === "Interested" ? "bg-status-research_light text-status-research" : ""}
                  ${opportunity.status === "Preparing" ? "bg-status-review_light text-status-review" : ""}
                  ${opportunity.status === "Awaiting Decision" ? "bg-status-pending_light text-status-pending" : ""}
                  ${opportunity.status === "Won" ? "bg-status-success_light text-status-success" : ""}
                  ${opportunity.status === "Lost" ? "bg-status-planning_light text-status-planning" : ""}
                  px-3 py-1 text-sm text-nowrap
                `}
                  >
                    {opportunity.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Value
                          </h3>
                          <p className="font-semibold">{opportunity.value}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Due Date
                          </h3>
                          <p className="font-semibold">
                            {new Date(
                              opportunity.deadline
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Source
                          </h3>
                          <p className="font-semibold">{opportunity.source}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Category
                          </h3>
                          <p className="font-semibold">
                            {opportunity.category}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Solicitation Number
                          </h3>
                          <p className="font-semibold">
                            {opportunity.details?.solicitation_number || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Agency
                          </h3>
                          <p className="font-semibold">
                            {opportunity.details?.agency || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Place of Performance
                          </h3>
                          <p className="font-semibold">
                            {opportunity.details?.place_of_performance || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            NAICS Code
                          </h3>
                          <p className="font-semibold">
                            {opportunity.details?.naics_code || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500">
                        Set Aside
                      </h3>
                      <p className="font-semibold">
                        {opportunity.details?.set_aside || "N/A"}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500">
                        Contact Information
                      </h3>
                      <p className="font-semibold">
                        {opportunity.details?.contact_info || "N/A"}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="text-center py-8 text-gray-500">
                      No documents available for this opportunity yet.
                    </div>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="text-center py-8 text-gray-500">
                      No notes available for this opportunity yet.
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Update Status</h3>
                  <Select
                    value={opportunity.status}
                    onValueChange={(value) =>
                      handleStatusChange(value as BidOpportunity["status"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Interested",
                        "Preparing",
                        "Awaiting Decision",
                        "Won",
                        "Lost"
                      ].map((status) => (
                        <SelectItem key={status} value={status}>
                          <span>{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline">Download Details</Button>
                    <Button variant="outline">Share Opportunity</Button>
                    <Button variant="destructive">Remove from Pipeline</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BidDetail);
