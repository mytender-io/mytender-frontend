import { Menu, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { Section } from "../views/BidWritingStateManagerView";
import { Circle, Clock, CheckCircle, Minus, TriangleAlert } from "lucide-react";

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

  const getStatusStyles = (status: ValidStatus): { sx: any } => {
    const baseStyles = {
      fontWeight: 700,
      fontSize: '1.125rem',
      whiteSpace: 'nowrap',
      textTransform: 'none',
      '&:hover': {
        opacity: 0.9,
      }
    };

    switch (status) {
      case "Completed":
        return {
          sx: {
            ...baseStyles,
            backgroundColor: '#e0f5e9',
            color: '#2a7f4f',
            '&:hover': {
              backgroundColor: '#e0f5e9',
            }
          }
        };
      case "In Progress":
        return {
          sx: {
            ...baseStyles,
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            color: '#ff8c00',
            '&:hover': {
              backgroundColor: 'rgba(255, 140, 0, 0.1)',
            }
          }
        };
      case "Not Started":
        return {
          sx: {
            ...baseStyles,
            backgroundColor: '#ffe4dc',
            color: '#d14d1f',
            '&:hover': {
              backgroundColor: '#ffe4dc',
            }
          }
        };
      default:
        return {
          sx: {
            ...baseStyles,
            backgroundColor: '#ffe4dc',
            color: '#d14d1f',
            '&:hover': {
              backgroundColor: '#ffe4dc',
            }
          }
        };
    }
  };

  const getStatusIcon = (status: ValidStatus) => {
    const iconProps = {
      className: "ml-2 inline-block align-middle",
      size: 16
    };

    switch (status) {
      case "Completed":
        return <CheckCircle {...iconProps} />;
      case "In Progress":
        return <Clock {...iconProps} />;
      case "Not Started":
        return <TriangleAlert {...iconProps} />;
      default:
        return <TriangleAlert {...iconProps} />;
    }
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        {...getStatusStyles(currentStatus)}
        disableElevation
        disableRipple
        variant="contained"
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
          sx: {
            width: '120px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem
          onClick={() => handleSelect("Not Started")}
          sx={{ '&:hover': { backgroundColor: '#f3f4f6' } }}
        >
          Not Started
        </MenuItem>
        <MenuItem
          onClick={() => handleSelect("In Progress")}
          sx={{ '&:hover': { backgroundColor: '#f3f4f6' } }}
        >
          In Progress
        </MenuItem>
        <MenuItem
          onClick={() => handleSelect("Completed")}
          sx={{ '&:hover': { backgroundColor: '#f3f4f6' } }}
        >
          Completed
        </MenuItem>
      </Menu>
    </div>
  );
};

export default StatusMenu;