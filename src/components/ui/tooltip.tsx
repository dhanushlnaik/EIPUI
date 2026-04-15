"use client";

import * as React from "react";
import { Box } from "@chakra-ui/react";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip({ children, content, disabled, ...rest }, ref) {
    if (disabled) return <>{children}</>;

    const title = typeof content === "string" ? content : undefined;
    return (
      <Box as="span" ref={ref as any} title={title} {...rest}>
        {children}
      </Box>
    );
  }
);
