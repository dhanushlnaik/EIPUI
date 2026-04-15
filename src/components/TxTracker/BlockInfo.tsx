import { Stat } from "@/components/ui/compat";
import React, { useState, useEffect } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, Text, SimpleGrid, Icon, Flex, HStack, Skeleton } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import {
  FaEthereum,
  FaGasPump,
  FaFire,
  FaList,
  FaCube,
  FaClock,
  FaCoins
} from 'react-icons/fa';
import { convertEthToUSD, convertGweiToUSD } from './ethereumService';
import MongoDataService, { type LatestValues } from '@/services/MongoDataService';

const numberFmt = (v: any) =>
  typeof v === 'number'
    ? Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v)
    : v;

const chipBg = (mode: 'light' | 'dark') =>
  mode === 'light' ? 'whiteAlpha.700' : 'whiteAlpha.200';

const BlockInfo = ({
  title,
  ethPriceInUSD,
  isLoading: externalLoading = false
}: {
  title: string;
  ethPriceInUSD: number;
  isLoading?: boolean;
}) => {
  const [mongoData, setMongoData] = useState<LatestValues | null>(null);
  const mode: 'light' | 'dark' = useColorModeValue('light', 'dark') as 'light' | 'dark';

  const cardBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(245,247,250,0.6) 100%)',
    'linear-gradient(135deg, rgba(35,39,47,0.85) 0%, rgba(26,32,44,0.75) 100%)'
  );
  const headerGradient = useColorModeValue(
    'linear-gradient(90deg,#4f46e5,#6366f1)',
    'linear-gradient(90deg,#4338ca,#6366f1)'
  );
  const tileBg = useColorModeValue('whiteAlpha.700', 'whiteAlpha.100');
  const tileBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const iconChipBg = chipBg(mode);
  const shadow = useColorModeValue(
    '0 4px 18px -2px rgba(99,102,241,0.25)',
    '0 4px 22px -4px rgba(99,102,241,0.35)'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subColor = useColorModeValue('gray.500', 'gray.400');

  // Subscribe to MongoDB data
  useEffect(() => {
    const mongoService = MongoDataService.getInstance();
    
    const unsubscribe = mongoService.subscribe((data: LatestValues) => {
      setMongoData(data);
    });

    // Start the service if not already started
    mongoService.startAutoRefresh(30000);

    return unsubscribe;
  }, []);

  const isLoading = externalLoading || mongoData?.isLoading || !mongoData;

  const metrics = !mongoData ? [] : [
    {
      key: 'block',
      label: 'Block Number',
      value: numberFmt(mongoData.blockNumber),
      icon: FaCube,
      help: 'Latest block from MongoDB data'
    },
    {
      key: 'baseFee',
      label: 'Base Fee',
      value: `${mongoData.baseFeeGwei.toFixed(2)} gwei`,
      icon: FaCoins,
      usd: convertGweiToUSD(mongoData.baseFeeGwei, ethPriceInUSD),
      help: 'Minimum fee to include transaction'
    },
    {
      key: 'priorityFee',
      label: 'Priority Fee',
      value: `${mongoData.priorityFeeGwei.toFixed(2)} gwei`,
      icon: FaCoins,
      usd: convertGweiToUSD(mongoData.priorityFeeGwei, ethPriceInUSD),
      help: 'Tip for faster processing'
    },
    {
      key: 'gasUsed',
      label: 'Gas Used',
      value: `${numberFmt(mongoData.gasUsed)} (${mongoData.gasUsedPercentage}%)`,
      icon: FaGasPump,
      help: 'Block capacity utilization'
    },
    {
      key: 'gasLimit',
      label: 'Gas Limit',
      value: numberFmt(mongoData.gasLimit),
      icon: FaGasPump,
      help: 'Maximum gas per block'
    },
    {
      key: 'gasBurnt',
      label: 'ETH Burned',
      value: `${(mongoData.gasBurnt / 1e18).toFixed(6)} ETH`,
      icon: FaFire,
      usd: convertEthToUSD(mongoData.gasBurnt / 1e18, ethPriceInUSD),
      help: 'ETH permanently removed from supply'
    },
    {
      key: 'txs',
      label: 'Transactions',
      value: numberFmt(mongoData.totalTransactions),
      icon: FaList,
      help: 'Total transactions in latest block'
    },
    {
      key: 'updated',
      label: 'Last Updated',
      value: mongoData.timestamp.toLocaleTimeString(),
      icon: FaClock,
      help: 'When this data was last refreshed'
    }
  ];

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      p={0}
      overflow="hidden"
      bg={cardBg}
      backdropFilter="blur(14px)"
      border="1px solid"
      borderColor={useColorModeValue('blackAlpha.200', 'whiteAlpha.200')}
      boxShadow={shadow}
      mx="auto"
      w="100%"
      mt={10}
    >
      <Box
        px={{ base: 5, md: 8 }}
        py={5}
        bg={headerGradient}
        color="white"
        display="flex"
        alignItems="center"
        gap={3}
      >
        <Flex
          align="center"
          justify="center"
          w="42px"
          h="42px"
          borderRadius="full"
          bg="whiteAlpha.300"
        >
          <Icon as={FaEthereum} boxSize={6} />
        </Flex>
        <Box>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="xs" opacity={0.85}>
            Real‑time execution layer snapshot
          </Text>
        </Box>
      </Box>
      <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, xl: 4 }}
          gap={{ base: 4, md: 6 }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  height="110px"
                  borderRadius="lg"
                  fadeDuration={0.5}
                  css={{
                    '--start-color': 'purple.300',
                    '--end-color': 'purple.600'
                  }} />
              ))
            : metrics.map((m) => (
                <Stat.Root
                  key={m.key}
                  bg={tileBg}
                  backdropFilter="blur(6px)"
                  border="1px solid"
                  borderColor={tileBorder}
                  borderRadius="lg"
                  p={4}
                  position="relative"
                  _hover={{
                    transform: 'translateY(-4px)',
                    transition: '0.25s',
                    boxShadow: shadow
                  }}
                  transition="0.25s"
                >
                  <HStack gap={3} mb={1} align="center">
                    <Flex
                      w="38px"
                      h="38px"
                      borderRadius="lg"
                      align="center"
                      justify="center"
                      bg={iconChipBg}
                    >
                      <Icon as={m.icon} color="purple.400" />
                    </Flex>
                    <Stat.Label
                      fontSize="sm"
                      color={subColor}
                      lineHeight="1.1"
                      maxW="130px"
                    >
                      {m.label}
                    </Stat.Label>
                  </HStack>
                  <Stat.ValueText
                    fontSize="xl"
                    fontWeight="semibold"
                    color={textColor}
                  >
                    {m.value}
                  </Stat.ValueText>
                  {(m.usd !== undefined || m.help) && (
                    <Stat.HelpText mt={1} fontSize="xs">
                      {m.usd !== undefined && (
                        <Tooltip
                          showArrow
                          content="Approximate USD (spot)"
                          bg="purple.600"
                          color="white"
                        >
                          <Box as="span" color="purple.400" fontWeight="medium">
                            ${numberFmt(m.usd)}
                          </Box>
                        </Tooltip>
                      )}
                      {m.usd !== undefined && m.help && ' • '}
                      {m.help && <Box as="span">{m.help}</Box>}
                    </Stat.HelpText>
                  )}
                </Stat.Root>
              ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default React.memo(BlockInfo);