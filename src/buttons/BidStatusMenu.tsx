import { Menu, MenuItem, Button } from "@mui/material";
import { useState } from "react";
import { Search, ClipboardList, FileWarning, FileCheck, FileSignature } from "lucide-react";

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

  const getStatusStyles = (status: BidStatus): { sx: any } => {
    const baseStyles = {
      fontWeight: 700,
      fontSize: '1.143rem',
      whiteSpace: 'nowrap',
      textTransform: 'none',
      border: 'none',
      '&:hover': {
        opacity: 0.9,
        border: 'none'
      }
    };

    const colors = {
      Planning: {
        backgroundColor: '#FFE4DC',
        color: '#D14D1F',
      },
      Research: {
        backgroundColor: '#E1F3FB',
        color: '#2B87AF',
      },
      "First Draft": {
        backgroundColor: '#E6FFE6',
        color: '#2E8B2E',
      },
      Reviewing: {
        backgroundColor: '#F8E6F8',
        color: '#8B488B',
      },
      Complete: {
        backgroundColor: '#E0F5E9',
        color: '#2A7F4F',
      }
    };

    return {
      sx: {
        ...baseStyles,
        backgroundColor: colors[status].backgroundColor,
        color: colors[status].color,
        '&:hover': {
          ...baseStyles['&:hover'],
          backgroundColor: colors[status].backgroundColor,
        }
      }
    };
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
        {...getStatusStyles(currentStatus)}
        disableElevation
        disableRipple
        variant="contained"
        aria-controls="bid-status-menu"
        aria-haspopup="true"
      >
        {currentStatus}
        <StatusIcon className="ml-2" size={16} />
      </Button>
      
      <Menu
        id="bid-status-menu"
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
        {["Planning", "Research", "First Draft", "Reviewing", "Complete"].map((status) => {
          const Icon = getStatusIcon(status as BidStatus);
          return (
            <MenuItem
              key={status}
              onClick={() => handleSelect(status as BidStatus)}
              sx={{
                fontSize: '1rem',
                padding: '0.571rem 1.143rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {status}
             
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default BidStatusMenu;