import { Divider } from "@/components/ui/compat";
import React, { useMemo } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, Heading, Text, Flex, Button, VStack, HStack, Avatar, Badge, Spinner } from "@chakra-ui/react";
import { FiDownload, FiClock, FiGitPullRequest } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import dynamic from 'next/dynamic';

const DualAxes = dynamic(() => import('@ant-design/plots').then((mod) => mod.DualAxes), {
  ssr: false,
  loading: () => (
    <Flex justify="center" align="center" height="400px">
      <Spinner size="xl" />
    </Flex>
  ),
});

interface EditorActivityTimelineProps {
  data: any;
  timePeriod: string;
}

const EditorActivityTimeline: React.FC<EditorActivityTimelineProps> = ({
  data,
  timePeriod,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerColor = useColorModeValue('#2b6cb0', '#4FD1FF');

  const timelineData = data?.timelineData || [];
  const recentActivities = data?.recentActivities || [];

  const chartConfig = useMemo(() => ({
    data: [timelineData, timelineData],
    xField: 'date',
    yField: ['reviews', 'responseTime'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#5B8FF9',
      },
      {
        geometry: 'line',
        color: '#5AD8A6',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: true,
      },
    },
    yAxis: {
      reviews: {
        title: {
          text: 'Number of Reviews',
          style: { fontSize: 12 },
        },
      },
      responseTime: {
        title: {
          text: 'Avg Response Time (hours)',
          style: { fontSize: 12 },
        },
      },
    },
    legend: {
      position: 'top-right' as const,
    },
  }), [timelineData]);

  const csvData = timelineData.map((item: any) => ({
    Date: item.date,
    'Total Reviews': item.reviews,
    'Avg Response Time (hours)': item.responseTime,
    'Active Editors': item.activeEditors,
  }));

  return (
    <VStack gap={6} align="stretch">
      {/* Timeline Chart */}
      <Box
        bg={cardBg}
        p={{ base: 4, md: 5 }}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" fontWeight="bold" color={headerColor}>
              Activity Timeline
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Review volume and response time trends
            </Text>
          </Box>
          <CSVLink data={csvData} filename={`activity-timeline-${timePeriod}.csv`}>
            <Button size="sm" colorPalette="blue"><FiDownload />Export
                          </Button>
          </CSVLink>
        </Flex>
        <Box height="400px">
          <DualAxes {...chartConfig} />
        </Box>
      </Box>
      {/* Recent Activities */}
      <Box
        bg={cardBg}
        p={{ base: 4, md: 5 }}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="lg" fontWeight="bold" color={headerColor} mb={4}>
          Recent Review Activities
        </Heading>
        <VStack gap={3} align="stretch">{recentActivities.slice(0, 10).map((activity: any, index: number) => (
            <Flex key={index} align="center" gap={4}>
              <Avatar.Root size="sm"><Avatar.Fallback name={activity.editor} /><Avatar.Image src={`https://github.com/${activity.editor}.png?size=50`} /></Avatar.Root>
              <VStack align="start" gap={0} flex={1}>
                <HStack>
                  <Text fontWeight="semibold">{activity.editor}</Text>
                  <Badge colorPalette="blue">{activity.action}</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  PR #{activity.prNumber} • {activity.repo}
                </Text>
              </VStack>
              <VStack align="end" gap={0}>
                <Text fontSize="xs" color="gray.500">
                  {activity.timeAgo}
                </Text>
                {activity.responseTime && (
                  <HStack gap={1}>
                    <FiClock size={12} />
                    <Text fontSize="xs">{activity.responseTime}h</Text>
                  </HStack>
                )}
              </VStack>
            </Flex>
          ))}</VStack>
      </Box>
    </VStack>
  );
};

export default EditorActivityTimeline;
