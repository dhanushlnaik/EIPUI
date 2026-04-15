import { Accordion, HStack } from "@chakra-ui/react";
import * as React from "react";
import { LuChevronDown } from "react-icons/lu";

type AccordionItemTriggerProps = {
  indicatorPlacement?: "start" | "end";
  children?: React.ReactNode;
  [key: string]: any;
};

export const AccordionItemTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionItemTriggerProps
>(function AccordionItemTrigger(props, ref) {
  const { children, indicatorPlacement = "end", ...rest } = props;
  return (
    <Accordion.ItemTrigger {...rest} ref={ref as any}>
      {indicatorPlacement === "start" && (
        <Accordion.ItemIndicator>
          <LuChevronDown />
        </Accordion.ItemIndicator>
      )}
      <HStack gap="4" flex="1" textAlign="start" width="full">
        {children}
      </HStack>
      {indicatorPlacement === "end" && (
        <Accordion.ItemIndicator>
          <LuChevronDown />
        </Accordion.ItemIndicator>
      )}
    </Accordion.ItemTrigger>
  );
});

type AccordionItemContentProps = {
  children?: React.ReactNode;
  [key: string]: any;
};

export const AccordionItemContent = React.forwardRef<
  HTMLDivElement,
  AccordionItemContentProps
>(function AccordionItemContent(props, ref) {
  const { children, ...rest } = props;
  return (
    <Accordion.ItemContent {...rest} ref={ref as any}>
      <Accordion.ItemBody>{children}</Accordion.ItemBody>
    </Accordion.ItemContent>
  );
});

export const AccordionRoot = Accordion.Root;
export const AccordionItem = Accordion.Item;
