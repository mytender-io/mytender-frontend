import { useEffect, useRef, useState } from "react";
import { ITenderBid } from "../../types";
import { useAuthUser } from "react-auth-kit";
import axios from "../helper/axios";
import { apiURL } from "../helper/urls";

const useTenderBids = () => {
  const [tenderBids, setTenderBids] = useState<ITenderBid[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  useEffect(() => {
    if (auth) {
      fetchTenderBids();
    }
  }, [auth]);

  const fetchTenderBids = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        apiURL("get_bids_list"),
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTenderBids(data.bids);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return { tenderBids, loading, error, fetchTenderBids };
};

export default useTenderBids;
