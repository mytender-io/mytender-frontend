import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { Section } from "../views/BidWritingStateManagerView";
import { Circle, Clock, CheckCircle } from "lucide-react";

type ValidStatus = "Not Started" | "In Progress" | "Completed";

const StatusMenu = ({
  value,
  onChange
}: {
  value: Section["status"];
  onChange: (value: Section["status"]) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const normalizeStatus = (status: any): ValidStatus => {
    const validStatuses: ValidStatus[] = ["Not Started", "In Progress", "Completed"];
    return validStatuses.includes(status) ? status : "Not Started";
  };

  const currentStatus = normalizeStatus(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (status: ValidStatus) => {
    onChange(status);
    handleClose();
  };

  const getStatusColor = (status: ValidStatus) => {
    switch (status) {
      case "Completed":
        return "status-complete";
      case "In Progress":
        return "status-in-progress";
      case "Not Started":
        return "status-not-started";
      default:
        return "status-not-started";
    }
  };

  const getStatusIcon = (status: ValidStatus) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="status-icon" size={16} />;
      case "In Progress":
        return <Clock className="status-icon" size={16} />;
      case "Not Started":
        return <Circle className="status-icon" size={16} />;
      default:
        return <Circle className="status-icon" size={16} />;
    }
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        className={`${getStatusColor(currentStatus)} text-nowrap d-inline-block status-menu-button`}
        aria-controls="simple-menu"
        aria-haspopup="true"
      >
        {currentStatus}
        {getStatusIcon(currentStatus)}
      </Button>
      <Menu
        id="simple-menu"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        keepMounted
        PaperProps={{
          elevation: 1,
          style: {
            width: "120px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }
        }}
      >
        <MenuItem onClick={() => handleSelect("Not Started")} className="styled-menu-item">
          Not Started {getStatusIcon("Not Started")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect("In Progress")} className="styled-menu-item">
          In Progress {getStatusIcon("In Progress")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect("Completed")} className="styled-menu-item">
          Completed {getStatusIcon("Completed")}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default StatusMenu;