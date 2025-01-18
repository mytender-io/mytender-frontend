import React from "react";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";

const CopyButton = (props: IconButtonProps) => {
  const { onClick, ...rest } = props;
  const [style, setStyle] = React.useState<{ color?: string }>({ color: "#696767" });
  const [tooltipText, setTooltipText] = React.useState("Copied");
  const [open, setOpen] = React.useState(false);
  return (
    <Tooltip
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title={tooltipText}
      slotProps={{
        popper: {
          disablePortal: true,
        },
      }}
    >
      <IconButton
        {...rest}
        onClick={(e) => {
          setOpen(true);
          setStyle({ color: "black" });
          setTimeout(() => {
            setStyle({
              color: "#696767",
            });
            setOpen(false);
          }, 2000);
          onClick && onClick(e);
          setTooltipText("Copied");
        }}
      >
        <ContentCopyIcon fontSize="small" style={style} />
      </IconButton>
    </Tooltip>
  );
  return;
};

export default CopyButton;
