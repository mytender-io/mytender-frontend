import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { Search, ClipboardList, FileWarning, FileCheck, FileSignature } from "lucide-react";
import "./BidStatusMenu.css";

type BidStatus = "Planning" | "Research" | "First Draft" | "Reviewing" | "Complete";

const BidStatusMenu = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: BidStatus) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const statusMapping: { [key: string]: BidStatus } = {
    Identification: "Planning",
    "Capture Planning": "Research",
    "First Review": "First Draft",
    Reviewing: "Reviewing",
    Submitted: "Complete"
  };

  const normalizeStatus = (status: any): BidStatus => {
    const validStatuses: BidStatus[] = ["Planning", "Research", "First Draft", "Reviewing", "Complete"];
    return status in statusMapping ? statusMapping[status] : (validStatuses.includes(status) ? status : "Planning");
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
    const colors = {
      Planning: "status-identification",
      Research: "status-capture",
      "First Draft": "status-first-review",
      Reviewing: "status-final-review",
      Complete: "status-submitted"
    };
    return colors[status] || "status-identification";
  };

  const getStatusIcon = (status: BidStatus) => {
    const icons = {
      Planning: Search,
      Research: ClipboardList,
      "First Draft": FileWarning,
      Reviewing: FileCheck,
      Complete: FileSignature
    };
    return icons[status] || Search;
  };

  const StatusIcon = getStatusIcon(currentStatus);

  return (
    <div>
      <Button
        onClick={handleClick}
        className={`${getStatusColor(currentStatus)} text-nowrap d-inline-block bid-status-menu`}
        aria-controls="bid-status-menu"
        aria-haspopup="true"
      >
        {currentStatus}
        <StatusIcon className="ms-2" size={16} />
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
            width: "160px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }
        }}
      >
        {["Planning", "Research", "First Draft", "Reviewing", "Complete"].map((status) => {
          const Icon = getStatusIcon(status as BidStatus);
          return (
            <MenuItem
              key={status}
              onClick={() => handleSelect(status as BidStatus)}
              className="styled-menu-item"
            >
              {status}
              <Icon className="ms-2" size={16} />
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default BidStatusMenu;