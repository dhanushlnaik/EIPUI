import { Steps, HStack, IconButton, NumberInput } from "@chakra-ui/react";
import * as React from "react"
import { LuMinus, LuPlus } from "react-icons/lu"

export interface StepperInputProps extends NumberInput.RootProps {
  label?: React.ReactNode
}

export const StepperInput = React.forwardRef<HTMLDivElement, StepperInputProps>(
  function StepperInput(props, ref) {
    const { label, ...rest } = props
    return (
      <NumberInput.Root {...rest} unstyled ref={ref}>
        {label && <NumberInput.Root>{label}</NumberInput.Root>}
        <HStack gap="2">
          <DecrementTrigger />
          <NumberInput.Root textAlign="center" fontSize="lg" minW="3ch" />
          <IncrementTrigger />
        </HStack>
      </NumberInput.Root>
    );
  },
)

const DecrementTrigger = React.forwardRef<
  HTMLButtonElement,
  NumberInput.DecrementTriggerProps
>(function DecrementTrigger(props, ref) {
  return (
    <NumberInput.Root {...props} asChild ref={ref}>
      <IconButton variant="outline" size="sm">
        <LuMinus />
      </IconButton>
    </NumberInput.Root>
  );
})

const IncrementTrigger = React.forwardRef<
  HTMLButtonElement,
  NumberInput.IncrementTriggerProps
>(function IncrementTrigger(props, ref) {
  return (
    <NumberInput.Root {...props} asChild ref={ref}>
      <IconButton variant="outline" size="sm">
        <LuPlus />
      </IconButton>
    </NumberInput.Root>
  );
})
