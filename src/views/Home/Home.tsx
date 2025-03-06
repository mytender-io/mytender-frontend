import React, { useState, useEffect, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import withAuth from "@/routes/withAuth.tsx";
import BidStatusMenu from "../Bids/components/BidStatusMenu.tsx";
import { Spinner } from "@/components/ui/spinner";

interface Bid {
  _id: string;
  bid_title: string;
  status:
    | "Identification"
    | "Capture Planning"
    | "First Review"
    | "Final Review"
    | "Submitted";
  timestamp?: string;
  submission_deadline?: string;
  client_name?: string;
  bid_manager?: string;
  opportunity_owner?: string;
  bid_qualification_result?: string;
  win_themes?: string[];
  [key: string]: string | string[] | undefined; // Index signature for dynamic access
}

const Home = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_bids_list/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (response.data && response.data.bids) {
        setBids(response.data.bids);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const parentPages = [] as Array<{ name: string; path: string }>;

  // Function stub for updateBidStatus - will not actually update anything since menu is disabled
  const updateBidStatus = (bidId, newStatus) => {
    console.log("Status update disabled:", bidId, newStatus);
    // No actual implementation since it should be disabled
  };

  // Calculate estimated value of all bids
  const calculateTotalBidValue = () => {
    if (!bids.length) return 0;
    
    // This is a placeholder - you might want to replace this with actual bid value calculation
    // Assuming each bid has an estimated_value property
    return bids.reduce((total, bid) => {
      const value = bid.estimated_value ? parseFloat(bid.estimated_value.toString()) : 0;
      return total + value;
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation currentPage="Home" parentPages={parentPages} />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="block text-2xl font-semibold">
              Bid Center
            </span>
            <span className="block text-base text-gray-hint_text">
              Access all the key analytics of your bidding
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Bids Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Recent Bids</h2>
            <p className="text-sm text-gray-500 mb-4">Last {Math.min(5, bids.length)} bids you've worked on</p>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 font-medium text-sm py-2 border-b">
                  <div>Tender Name</div>
                  <div>Status</div>
                </div>
                
                {bids
                  .sort((a, b) => {
                    // Sort by timestamp in descending order (newest first)
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                  })
                  .slice(0, 5)
                  .map((bid) => {
                  return (
                    <div key={bid._id} className="grid grid-cols-2 text-sm py-2">
                      <div className="truncate">{bid.bid_title || bid.client_name || "Unnamed Bid"}</div>
                      <div>
                        <BidStatusMenu
                          value={bid.status}
                          onChange={(value) => {
                            // This will not update since it's disabled
                            updateBidStatus(bid._id, value);
                          }}
                          disabled={true}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {bids.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No bids available
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tasks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Tasks</h2>
            <p className="text-sm text-gray-500">View assigned questions</p>
            
            {/* You can add task content here based on your requirements */}
            <div className="text-center py-8 text-gray-500">
              No tasks assigned yet
            </div>
          </div>
          
          {/* Potential Revenue Opportunities Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Potential Revenue Opportunities</h2>
            <p className="text-sm text-gray-500 mb-4">Overview of financial potential</p>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-3xl font-bold text-green-600">
                    ${calculateTotalBidValue().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Estimated total value
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 font-medium text-sm py-2 border-b">
                    <div>Category</div>
                    <div className="text-right">Count</div>
                  </div>
                  
                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>Active bids</div>
                    <div className="text-right">{bids.length}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>High probability</div>
                    <div className="text-right">
                      {bids.filter(b => b.win_probability === "high").length || 0}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 text-sm py-2">
                    <div>Medium probability</div>
                    <div className="text-right">
                      {bids.filter(b => b.win_probability === "medium").length || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Home);