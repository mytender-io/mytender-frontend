import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";

const BidDropdown = ({ onBidSelect, token, className = "" }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_bids_list/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data?.bids) {
        console.log(response.data?.bids);
        setBids(response.data.bids);
        if (response.data.bids.length > 0) {
          const firstBid = response.data.bids[0];
          handleBidSelect(firstBid);
        }
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSelect = (bid) => {
    setSelectedBid(bid);
    console.log("selectedbid");
    console.log(bid._id);
    onBidSelect(bid._id);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center justify-between w-48 px-4 py-2 text-xl font-medium bg-white border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">
          {loading
            ? "Loading bids..."
            : selectedBid
              ? selectedBid.bid_title
              : "Select Bid"}
        </span>
        {loading ? (
          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
        ) : (
          <ChevronDown
            className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-48 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <ul className="py-1 overflow-auto max-h-60" role="menu">
            {bids.map((bid) => (
              <li
                key={bid._id}
                onClick={() => handleBidSelect(bid)}
                className="flex items-center px-4 py-2 text-base text-black cursor-pointer hover:bg-orange_ultra_light"
                role="menuitem"
              >
                <span className="flex-grow truncate">{bid.bid_title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BidDropdown;
