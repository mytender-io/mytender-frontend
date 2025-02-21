import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const BidDropdown = ({ onBidSelect, token }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

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
          handleBidSelect(response.data.bids[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSelect = (bidId: string) => {
    console.log("selectedbid");
    console.log(bidId);
    onBidSelect(bidId);
  };

  return (
    <Select disabled={loading} onValueChange={handleBidSelect}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder={loading ? "Loading bids..." : "Select Bid"} />
      </SelectTrigger>
      <SelectContent>
        {bids.map((bid) => (
          <SelectItem key={bid._id} value={bid._id}>
            {bid.bid_title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BidDropdown;
