import { Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
import React, { useMemo } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, Text, Table, Icon, Skeleton, Flex, HStack, Badge } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { FaCube, FaGasPump, FaFire, FaCoins } from 'react-icons/fa';
import Web3 from 'web3';
import { convertEthToUSD, convertGweiToUSD } from './ethereumService';

interface RecentBlocksProps {
  blocks: any[];
  ethPriceInUSD: number;
  isLoading?: boolean;
  limit?: number;
}

const nf = (n: any, max = 2) =>
  isFinite(Number(n))
    ? Intl.NumberFormat('en-US', { maximumFractionDigits: max }).format(Number(n))
    : n;

const RecentBlocks = ({
  blocks,
  ethPriceInUSD,
  isLoading = false,
  limit = 10 // Reduced default limit
}: RecentBlocksProps) => {
  // Memoize data processing to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (!blocks || !Array.isArray(blocks)) return [];
    return blocks.slice(0, limit).filter(block => block && block.number);
  }, [blocks, limit]);
  
  if ((!data || data.length === 0) && !isLoading) return null;

  const cardBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const headerGradient = useColorModeValue(
    'linear-gradient(90deg,#4f46e5,#6366f1)',
    'linear-gradient(90deg,#4338ca,#6366f1)'
  );
  const cardBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(245,247,250,0.55) 100%)',
    'linear-gradient(135deg, rgba(30,34,43,0.85) 0%, rgba(20,25,35,0.75) 100%)'
  );
  const tableHeaderBg = useColorModeValue('whiteAlpha.600', 'whiteAlpha.200');
  const rowBg = useColorModeValue('whiteAlpha.500', 'whiteAlpha.100');
  const rowHover = useColorModeValue('whiteAlpha.700', 'whiteAlpha.200');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const colStyles = {
    fontSize: 'xs',
    letterSpacing: '.5px',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: textSecondary,
    py: 2
  } as const;

  const skeletonRows = Array.from({ length: 6 });

  return (
    <Box
      mt={10}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="2xl"
      overflow="hidden"
      bg={cardBg}
      backdropFilter="blur(14px)"
      boxShadow={useColorModeValue(
        '0 4px 18px -2px rgba(99,102,241,0.25)',
        '0 4px 22px -4px rgba(99,102,241,0.35)'
      )}
    >
      <Flex
        px={{ base: 5, md: 7 }}
        py={4}
        bg={headerGradient}
        align="center"
        gap={4}
        color="white"
      >
        <Flex
          w="46px"
          h="46px"
            borderRadius="lg"
          bg="whiteAlpha.300"
          align="center"
          justify="center"
        >
          <Icon as={FaCube} boxSize={6} />
        </Flex>
        <Box>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
            📚 Recent Block History
          </Text>
          <Text fontSize="xs" opacity={0.85}>
            Each block = a new "page" in Ethereum's ledger (last {data.length || 0} blocks)
          </Text>
        </Box>
      </Flex>
      <Box px={{ base: 3, md: 5 }} py={{ base: 4, md: 5 }} overflowX="auto">
        <Table.Root
          size="sm"
          variant="unstyled"
          minW="900px"
          css={{
            '& th, td': { whiteSpace: 'nowrap' }
          }}
        >
          <Table.Header>
            <Table.Row bg={tableHeaderBg}>
              <Table.ColumnHeader {...colStyles} textAlign="left">Block</Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">
                <HStack gap={1} justify="flex-end">
                  <Icon as={FaGasPump} /> Gas Target
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">Gas Used</Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">Txs</Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">Time</Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">
                <HStack gap={1} justify="flex-end">
                  <Icon as={FaCoins} /> Base Fee
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader {...colStyles} textAlign="right">
                <HStack gap={1} justify="flex-end">
                  <Icon as={FaFire} /> Burned
                </HStack>
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading &&
              skeletonRows.map((_, i) => (
                <Table.Row key={i}>
                  {Array.from({ length: 7 }).map((__, c) => (
                    <Table.Cell key={c} py={3}>
                      <Skeleton h="14px" w={c === 0 ? '60px' : '48px'} borderRadius="md" />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            {!isLoading &&
              data.map((block) => {
                const number = Number(block.number);
                const gasTarget = Number(block.gasLimit);
                const gasUsed = Number(block.gasUsed);
                const txCount = block.transactions?.length || 0;
                const time = new Date(Number(block.timestamp) * 1000);
                const baseFeeGwei = block?.baseFeePerGas
                  ? Number(Web3.utils?.fromWei(block.baseFeePerGas, 'gwei'))
                  : null;
                const burnedEth = block?.baseFeePerGas
                  ? Number(
                      Web3.utils?.fromWei(
                        (BigInt(block.gasUsed) * BigInt(block.baseFeePerGas)).toString(),
                        'ether'
                      )
                    )
                  : null;

                const gasPct = gasTarget
                  ? ((gasUsed / gasTarget) * 100).toFixed(1) + '%'
                  : '-';

                return (
                  <Table.Row
                    key={number}
                    bg={rowBg}
                    _hover={{ bg: rowHover }}
                    transition="0.2s"
                  >
                    <Table.Cell fontWeight="semibold" color={textPrimary}>
                      {nf(number, 0)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" color={textPrimary}>
                      {nf(gasTarget, 0)}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack gap={1} justify="flex-end">
                        <Text color={textPrimary}>{nf(gasUsed, 0)}</Text>
                        <Badge
                          fontSize="0.6rem"
                          colorPalette={
                            gasUsed / gasTarget > 0.95
                              ? 'red'
                              : gasUsed / gasTarget > 0.8
                              ? 'orange'
                              : 'purple'
                          }
                          variant="subtle"
                          borderRadius="md"
                          px={1.5}
                        >
                          {gasPct}
                        </Badge>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell textAlign="right" color={textPrimary}>
                      {nf(txCount, 0)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" color={textSecondary} fontSize="sm">
                      {time.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {baseFeeGwei !== null ? (
                        <Tooltip
                          showArrow
                          content={`≈ $${nf(
                            convertGweiToUSD(baseFeeGwei, ethPriceInUSD),
                            4
                          )} USD`}
                          bg="purple.600"
                          color="white"
                        >
                          <HStack gap={1} justify="flex-end">
                            <Text color="purple.400" fontWeight="medium">
                              {nf(baseFeeGwei, 2)} gwei
                            </Text>
                          </HStack>
                        </Tooltip>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {burnedEth !== null ? (
                        <Tooltip
                          showArrow
                          content={`≈ $${nf(
                            convertEthToUSD(burnedEth, ethPriceInUSD),
                            2
                          )} USD`}
                          bg="pink.500"
                          color="white"
                        >
                          <Text color="pink.400" fontWeight="medium">
                            {nf(burnedEth, 5)} ETH
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};

export default React.memo(RecentBlocks);