import React, { useState } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, Button, Flex, Grid, Heading, Text, Avatar, Badge, HStack, VStack, ButtonGroup, IconButton } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { BsListUl, BsBarChartFill } from 'react-icons/bs';
import { CSVLink } from 'react-csv';
import CopyLink from '@/components/CopyLink';
import dynamic from 'next/dynamic';
import DateTime from '@/components/DateTime';
import { LuEye, LuEyeOff } from 'react-icons/lu';

const Bar = dynamic(() => import('@ant-design/plots').then((mod) => mod.Bar), { ssr: false });

interface LeaderboardItem {
  reviewer: string;
  count: number;
}

interface LeaderboardGridProps {
  title: string;
  data: LeaderboardItem[];
  csvData: any[];
  csvFilename: string;
  onDownloadCSV: () => void;
  loading?: boolean;
  copyLink?: string;
  barChartConfig?: any;
  isReviewer?: boolean;
}

const LeaderboardGrid: React.FC<LeaderboardGridProps> = ({
  title,
  data,
  csvData,
  csvFilename,
  onDownloadCSV,
  loading = false,
  copyLink,
  barChartConfig,
  isReviewer = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');

  const displayedData = showAll ? data : data.slice(0, 1);
  const hasMore = data.length > 1;

  return (
    <Box
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 4, md: 5 }}
      width="100%"
      minH="420px"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Heading 
          size="lg" 
          fontWeight="bold"
          color={useColorModeValue('#2b6cb0', '#4FD1FF')}
        >
          {title}
          {copyLink && <CopyLink link={copyLink} />}
        </Heading>
        <HStack gap={2}>
          <ButtonGroup size="sm" attached variant="outline">
            <Tooltip content="List View">
              <IconButton
                aria-label="List view"
                onClick={() => setViewMode('list')}
                colorPalette={viewMode === 'list' ? 'blue' : 'gray'}
                variant={viewMode === 'list' ? 'solid' : 'outline'}><BsListUl /></IconButton>
            </Tooltip>
            <Tooltip content="Chart View">
              <IconButton
                aria-label="Chart view"
                onClick={() => setViewMode('chart')}
                colorPalette={viewMode === 'chart' ? 'blue' : 'gray'}
                variant={viewMode === 'chart' ? 'solid' : 'outline'}><BsBarChartFill /></IconButton>
            </Tooltip>
          </ButtonGroup>
          <CSVLink
            data={csvData?.length ? csvData : []}
            filename={csvFilename}
            onClick={onDownloadCSV}
          >
            <Button size="sm" colorPalette="blue" loading={loading}>
              Download CSV
            </Button>
          </CSVLink>
        </HStack>
      </Flex>
      {viewMode === 'list' ? (
        <>
          <VStack gap={3} align="stretch">
            {displayedData.map((item, index) => (
              <Box
                key={item.reviewer}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                bg={index === 0 && !showAll ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                transition="all 0.2s"
                _hover={{ bg: hoverBg, transform: 'translateY(-2px)', boxShadow: 'md' }}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack gap={4}>
                    <Badge
                      fontSize="lg"
                      colorPalette={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      #{(showAll ? 0 : 0) + index + 1}
                    </Badge>
                    <Avatar.Root size="md"><Avatar.Fallback name={item.reviewer} /><Avatar.Image src={`https://github.com/${item.reviewer}.png?size=40`} /></Avatar.Root>
                    <VStack align="start" gap={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {item.reviewer}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {isReviewer ? 'Reviewer' : 'Editor'}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" gap={0}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {item.count}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      reviews
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>

          {hasMore && (
            <Button
              mt={4}
              width="full"
              variant="outline"
              colorPalette="blue"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View More (${data.length - 1} more)`}
            </Button>
          )}
        </>
      ) : (
        <Box>
          {barChartConfig && <Bar {...barChartConfig} />}
        </Box>
      )}
      <Box mt={4}>
        <DateTime />
      </Box>
    </Box>
  );
};

export default LeaderboardGrid;
