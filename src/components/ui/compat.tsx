import { Box, Group, Table } from "@chakra-ui/react-original";
import React from 'react';
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

// Legacy Tabs
export const TabList = ({ children, ...props }: any) => <Box display="flex" borderBottom="1px solid #ccc" {...props}>{children}</Box>;
export const Tab = ({ children, ...props }: any) => <Box as="button" px="4" py="2" cursor="pointer" _hover={{ bg: "gray.100" }} {...props}>{children}</Box>;
export const TabPanels = Box;
export const TabPanel = Box;

// Legacy Inputs
export const InputLeftElement = ({ children, ...props }: any) => <Box mx="2" {...props}>{children}</Box>;
export const InputRightElement = ({ children, ...props }: any) => <Box mx="2" {...props}>{children}</Box>;

// Legacy Tables
export const TableContainer = ({ children, ...props }: any) => <Table.ScrollArea {...props}>{children}</Table.ScrollArea>;
export const Thead = Table.Header;
export const Tbody = Table.Body;
export const Tr = Table.Row;
export const Th = Table.ColumnHeader;
export const Td = Table.Cell;
export const Tfoot = Table.Footer ?? ((props: any) => <Box as="tfoot" {...props} />);

// Legacy Menus
export const MenuButton = ({ children, ...props }: any) => <Box as="button" {...props}>{children}</Box>;
export const MenuList = ({ children, ...props }: any) => <Box position="absolute" bg="white" shadow="md" {...props}>{children}</Box>;
export const MenuDivider = () => <Box borderBottom="1px solid #E2E8F0" my="1" />;

// Legacy Popover
export const PopoverCloseButton = () => <Box />;

// Missing Image Fallbacks
export const AvatarFallback = Box;
export const AvatarImage = Box;

export const HoverCard = Box;

export const shouldForwardProp = (prop: string) => true;

// Divider
export const Divider = ({ ...props }: any) => <Box borderBottomWidth="1px" {...props} />;

// Modal (Dialog)
export const Modal = ({ isOpen, onClose, children, ...props }: any) => (
  isOpen ? <Box position="fixed" top={0} left={0} w="100vw" h="100vh" zIndex={1000} bg="blackAlpha.600" display="flex" justifyContent="center" alignItems="center" {...props}>
    {children}
  </Box> : null
);
export const ModalOverlay = ({ ...props }: any) => <>{props.children}</>;
export const ModalContent = ({ children, ...props }: any) => <Box bg="white" color="black" p="4" borderRadius="md" minW="400px" {...props}>{children}</Box>;
export const ModalHeader = ({ children, ...props }: any) => <Box fontSize="xl" fontWeight="bold" mb="4" {...props}>{children}</Box>;
export const ModalBody = ({ children, ...props }: any) => <Box mb="4" {...props}>{children}</Box>;
export const ModalFooter = ({ children, ...props }: any) => <Box display="flex" justifyContent="flex-end" {...props}>{children}</Box>;
export const ModalCloseButton = ({ onClick }: any) => <button onClick={onClick} style={{ position: 'absolute', top: 10, right: 10 }}>X</button>;

// useDisclosure
export const useDisclosure = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    return { isOpen, open: isOpen, onOpen: () => setIsOpen(true), onClose: () => setIsOpen(false), onToggle: () => setIsOpen(!isOpen) };
};

// Progress
const ProgressBase = ({ value, ...props }: any) => (
  <Box w="100%" h="2" bg="gray.200" borderRadius="md" overflow="hidden" {...props}>
    <Box h="100%" bg="blue.500" w={`${value}%`} />
  </Box>
);
export const Progress = Object.assign(ProgressBase, {
  Root: ({ children, ...props }: any) => <Box {...props}>{children}</Box>,
  Track: ({ children, ...props }: any) => (
    <Box w="100%" h="2" bg="gray.200" borderRadius="md" overflow="hidden" {...props}>
      {children}
    </Box>
  ),
  Range: ({ ...props }: any) => <Box h="100%" bg="blue.500" w="100%" {...props} />,
});

// Stat
export const Stat = Object.assign(
  ({ children, ...props }: any) => <Box {...props}>{children}</Box>,
  {
    Root: ({ children, ...props }: any) => <Box {...props}>{children}</Box>,
    Label: ({ children, ...props }: any) => (
      <Box fontSize="sm" color="gray.500" {...props}>
        {children}
      </Box>
    ),
    ValueText: ({ children, ...props }: any) => (
      <Box fontSize="2xl" fontWeight="bold" {...props}>
        {children}
      </Box>
    ),
    HelpText: ({ children, ...props }: any) => (
      <Box fontSize="sm" color="gray.500" {...props}>
        {children}
      </Box>
    ),
    UpIndicator: (props: any) => <Box as={LuTrendingUp} display="inline-flex" {...props} />,
    DownIndicator: (props: any) => <Box as={LuTrendingDown} display="inline-flex" {...props} />,
  }
);
export const StatLabel = ({ children, ...props }: any) => <Box fontSize="sm" color="gray.500" {...props}>{children}</Box>;
export const StatNumber = ({ children, ...props }: any) => <Box fontSize="2xl" fontWeight="bold" {...props}>{children}</Box>;
export const StatHelpText = ({ children, ...props }: any) => <Box fontSize="sm" color="gray.500" {...props}>{children}</Box>;
export const StatGroup = ({ children, ...props }: any) => <Box display="flex" gap="4" {...props}>{children}</Box>;

// Checkbox
const CheckboxBase = ({ children, isChecked, onChange, ...props }: any) => (
  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} {...props}>
    <input type="checkbox" checked={isChecked} onChange={onChange} style={{ marginRight: '8px' }} />
    {children}
  </label>
);
export const Checkbox = Object.assign(CheckboxBase, {
  Root: ({ children, ...props }: any) => (
    <Box as="label" display="flex" alignItems="center" gap="2" cursor="pointer" {...props}>
      {children}
    </Box>
  ),
  HiddenInput: ({ ...props }: any) => <input type="checkbox" {...props} />,
  Control: ({ children, ...props }: any) => (
    <Box
      as="span"
      width="16px"
      height="16px"
      borderWidth="1px"
      borderColor="gray.400"
      borderRadius="sm"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      {children}
    </Box>
  ),
  Indicator: ({ ...props }: any) => <Box as="span" width="8px" height="8px" bg="currentColor" borderRadius="sm" {...props} />,
  Label: ({ children, ...props }: any) => <Box as="span" {...props}>{children}</Box>,
});
