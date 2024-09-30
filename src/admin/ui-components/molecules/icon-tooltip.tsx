import { ExclamationCircle, XCircle, InformationCircle } from "@medusajs/icons";
import React from "react";
import Tooltip, { TooltipProps } from "../atoms/tooltip";
import { IconProps } from "../icons/types";

type IconTooltipProps = TooltipProps & {
  type?: "info" | "warning" | "error";
  size?: number;
};

const IconTooltip: React.FC<IconTooltipProps> = ({
  type = "info",
  size = 16,
  content,
  ...props
}) => {
  const icon = (type: IconTooltipProps["type"]) => {
    switch (type) {
      case "warning":
        return (
          <ExclamationCircle size={size} className="text-orange-40 flex" />
        );
      case "error":
        return <XCircle size={size} className="text-rose-40 flex" />;
      default:
        return <InformationCircle size={size} className="text-grey-40 flex" />;
    }
  };

  return (
    <Tooltip content={content} {...props}>
      {icon(type)}
    </Tooltip>
  );
};

export default IconTooltip;
