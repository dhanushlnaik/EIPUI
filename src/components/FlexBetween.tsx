import { Flex, type FlexProps } from "@chakra-ui/react";
import React from 'react';

const FlexBetween = React.forwardRef<HTMLDivElement, FlexProps>((props, ref) => (
  <Flex justify="space-between" align="center" ref={ref} {...props} />
));
FlexBetween.displayName = "FlexBetween";

export default FlexBetween;