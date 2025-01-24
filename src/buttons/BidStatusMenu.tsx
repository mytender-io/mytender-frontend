import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faClipboardList,
  faFileCircleCheck,
  faFileSignature,
  faFileCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
import "./BidStatusMenu.css";

type BidStatus =
  | "Planning"
  | "Research"
  | "First Draft"
  | "Reviewing"
  | "Complete";

const BidStatusMenu = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: BidStatus) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Map old status values to new ones
  const statusMapping: { [key: string]: BidStatus } = {
    Identification: "Planning",
    "Capture Planning": "Research",
    "First Review": "First Draft",
    Reviewing: "Reviewing",
    Submitted: "Complete"
  };

  const normalizeStatus = (status: any): BidStatus => {
    const validStatuses: BidStatus[] = [
      "Planning",
      "Research",
      "First Draft",
      "Reviewing",
      "Complete"
    ];
    if (status in statusMapping) {
      return statusMapping[status];
    }
    return validStatuses.includes(status) ? status : "Planning";
  };

  const currentStatus = normalizeStatus(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (status: BidStatus) => {
    onChange(status);
    handleClose();
  };

  const getStatusColor = (status: BidStatus) => {
    switch (status) {
      case "Planning":
        return "status-identification";
      case "Research":
        return "status-capture";
      case "First Draft":
        return "status-first-review";
      case "Reviewing":
        return "status-final-review";
      case "Complete":
        return "status-submitted";
      default:
        return "status-identification";
    }
  };

  const getStatusIcon = (status: BidStatus) => {
    switch (status) {
      case "Planning":
        return faMagnifyingGlass;
      case "Research":
        return faClipboardList;
      case "First Draft":
        return faFileCircleExclamation;
      case "Reviewing":
        return faFileCircleCheck;
      case "Complete":
        return faFileSignature;
      default:
        return faMagnifyingGlass;
    }
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        className={`${getStatusColor(currentStatus)} text-nowrap d-inline-block bid-status-menu`}
        aria-controls="bid-status-menu"
        aria-haspopup="true"
      >
        {currentStatus}
        <FontAwesomeIcon icon={getStatusIcon(currentStatus)} className="ms-2" />
      </Button>
      <Menu
        id="bid-status-menu"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        keepMounted
        PaperProps={{
          elevation: 1,
          style: {
            width: "160px", // Reduced width since names are shorter
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }
        }}
      >
        {["Planning", "Research", "First Draft", "Reviewing", "Complete"].map(
          (status) => (
            <MenuItem
              key={status}
              onClick={() => handleSelect(status as BidStatus)}
              className="styled-menu-item"
            >
              {status}
            </MenuItem>
          )
        )}
      </Menu>
    </div>
  );
};

export default BidStatusMenu;
