import { Checkbox } from "@/components/ui/compat";
import { Steps, Menu, Button, Portal } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { Filter } from "react-feather";
import { LuChevronDown } from 'react-icons/lu';

interface LabelFilterProps {
  labels: string[];
  selectedLabels: string[];
  onLabelToggle: (label: string) => void;
  labelDisplayNames?: { [key: string]: string };
}

const LabelFilter: React.FC<LabelFilterProps> = ({
  labels,
  selectedLabels,
  onLabelToggle,
  labelDisplayNames = {},
}) => {
  // Force dark mode styles
  const menuBg = useColorModeValue("gray.800", "gray.800"); // Dark background
  const menuColor = useColorModeValue("white", "white"); // White text
  const buttonBg = useColorModeValue("gray.700", "gray.700"); // Dark button background
  const buttonColor = useColorModeValue("white", "white"); // White button text

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild><Button
          size="sm"
          ml={2}
          bg={buttonBg}
          color={buttonColor}
          // Darker hover state
          _hover={{ bg: "gray.600" }}
          // Darker active state
          _active={{ bg: "gray.600" }}>
          <Filter />
        </Button></Menu.Trigger>
      <Portal><Menu.Positioner><Menu.Content>
            {labels?.map((label) => (
              <Menu.Item key={label} bg={menuBg} color={menuColor} value='item-0'>
                <Checkbox.Root
                  onCheckedChange={() => onLabelToggle(label)}
                  colorPalette="blue"
                  checked={selectedLabels.includes(label)}
                ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
                  {labelDisplayNames[label] || label}
                </Checkbox.Label></Checkbox.Root>
              </Menu.Item>
            ))}
          </Menu.Content></Menu.Positioner></Portal>
    </Menu.Root>
  );
};

export default LabelFilter;