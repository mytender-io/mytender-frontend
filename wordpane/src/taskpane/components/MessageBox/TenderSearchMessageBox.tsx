import React, { useEffect } from "react";
import { Autocomplete, Popper, TextField } from "@mui/material";
import useTenderBids from "../../hooks/useTenderBids";
import _ from "lodash";
import MessageBox, { MessageBoxProps } from ".";
import { ITenderBid } from "../../../types";
import { truncateName } from "../../helper";

function CustomPopper(props) {
  return <Popper {...props} placement="bottom-start" />;
}

interface TenderSearchMessageBoxProps extends MessageBoxProps {
  selectedTenderBid: ITenderBid;
  setSelectedTenderBid: (bid: ITenderBid) => void;
}

const TenderSearchMessageBox = (props: TenderSearchMessageBoxProps) => {
  const { loading, tenderBids } = useTenderBids();
  const { selectedTenderBid, setSelectedTenderBid, ...rest } = props;

  return (
    <div className="tender-search-message-box">
      <div>
        <Autocomplete
          disablePortal
          options={_.map(tenderBids, (bid) => ({ label: truncateName(bid.bid_title, 50), id: bid.bid_title }))}
          renderInput={(params) => <TextField {...params} label="Tender Bid" />}
          loading={loading}
          value={_.find(
            _.map(tenderBids, (item) => ({ id: item.bid_title, label: item.bid_title })),
            (bid) => bid.id === selectedTenderBid?.bid_title
          )}
          onChange={(_event, value) => {
            const selectedBid = _.find(tenderBids, (bid) => bid.bid_title === value.id);
            setSelectedTenderBid(selectedBid);
          }}
          size="small"
          slots={{ popper: CustomPopper }}
          style={{ marginTop: "10px" }}
        />
      </div>
      <MessageBox {...rest} />
    </div>
  );
};

export default TenderSearchMessageBox;
