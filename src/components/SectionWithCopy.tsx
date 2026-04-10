"use client";
/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useClipboard: Use react-use: useCopyToClipboard

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import { Steps, Box, Flex, IconButton, Text, useClipboard } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCheck, LuCopy } from 'react-icons/lu';

interface SectionWithCopyProps {
  id: string;
  label: string;
  href: string;
  count?: number;
}

const SectionWithCopy = ({ id, label, href, count }: SectionWithCopyProps) => {
  const fullUrl = `https://eip.fun/type#${href}`;
  const { hasCopied, onCopy } = useClipboard(fullUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setCopied(true);
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  return (
    <Flex align="center" className="group" gap={2} wrap="wrap" id={id}>
      <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
        {label}
        {count !== undefined && (
          <>
            {" "}
            -{" "}
            <Text as="span" color="gray.600" fontSize="xl">
              [{count}]
            </Text>
          </>
        )}
      </Text>
      <IconButton
        size="sm"
        aria-label="Copy section link"
        onClick={onCopy}
        variant="ghost"
        colorPalette="blue"
        _hover={{ bg: "blue.100" }}>{copied ? <LuCheck /> : <LuCopy />}</IconButton>
      <Text className="hidden group-hover:block text-lg text-red-500">
        {copied ? "Copied!" : "* Count as on date"}
      </Text>
    </Flex>
  );
};

export default SectionWithCopy;
