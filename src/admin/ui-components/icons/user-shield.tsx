import React from "react";
import { IconProps } from "./types";

const UserShield = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        ref={ref}
        {...props}
      >
        <path d="M6 21v-2a4 4 0 0 1 4-4h2M22 16c0 4-2.5 6-3.5 6S15 20 15 16c1 0 2.5-.5 3.5-1.5 1 1 2.5 1.5 3.5 1.5zM8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0" />
      </svg>
    );
  }
);

UserShield.displayName = "UserShield";

export default UserShield;
