import React from "react";
import { useColorModeValue } from "./ui/color-mode";
import { Steps, Box, Accordion, Heading, Text } from "@chakra-ui/react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ title = "Frequently Asked Questions", faqs }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Heading size="md" mb={4}>
        {title}
      </Heading>
      <Accordion.Root collapsible>
        {faqs.map((faq, index) => (
          <Accordion.Item key={index} border="none" mb={2} value='item-0'>
            <Accordion.ItemTrigger
              _hover={{ bg: hoverBg }}
              borderRadius="md"
              py={3}
            >
              <Box flex="1" textAlign="left" fontWeight="semibold">
                {faq.question}
              </Box>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent pb={4} pt={2}><Accordion.ItemBody>
                <Text color={useColorModeValue("gray.600", "gray.400")}>
                  {faq.answer}
                </Text>
              </Accordion.ItemBody></Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Box>
  );
};

export default FAQSection;
