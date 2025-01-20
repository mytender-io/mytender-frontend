import React, { useEffect } from "react";
import { Autocomplete, Popper, TextField } from "@mui/material";
import useTenderBids from "../../hooks/useTenderBids";
import _ from "lodash";
import MessageBox, { MessageBoxProps } from ".";
import { ITenderBid } from "../../../types";

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
          options={_.map(tenderBids, (bid) => bid.bid_title)}
          renderInput={(params) => <TextField {...params} label="Tender Bid" />}
          loading={loading}
          value={selectedTenderBid?.bid_title}
          onChange={(_event, value) => {
            const selectedBid = _.find(tenderBids, (bid) => bid.bid_title === value);
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
