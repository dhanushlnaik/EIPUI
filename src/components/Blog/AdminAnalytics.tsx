"use client";
import { Stat, Progress } from "@/components/ui/compat";

import { TabList, Tab, TabPanels, TabPanel, Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
;
import { useState, useEffect } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, VStack, HStack, Text, Grid, GridItem, Badge, Table, Icon, Tabs, Separator } from "@chakra-ui/react";
import {
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaComment,
  FaDownload,
  FaUsers,
  FaTrophy,
  FaChartLine,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface AdminAnalyticsProps {
  blogSlug: string;
}

interface AnalyticsData {
  total_views: number;
  unique_views: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  downloads: number;
  net_score: number;
  engagement_rate: number;
  view_trend: number;
  top_referrers: Array<{ source: string; count: number }>;
  hourly_views: Array<{ hour: number; count: number }>;
  user_breakdown: {
    logged_in: number;
    anonymous: number;
  };
}

function StatCard({
  label,
  value,
  icon,
  trend,
  colorScheme = 'blue',
  colorPalette,
}: {
  label: string;
  value: number | string;
  icon: any;
  trend?: number;
  colorScheme?: string;
  colorPalette?: string;
}) {
  const tone = colorPalette ?? colorScheme;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        boxShadow="md"
      >
        <Stat.Root>
          <HStack justify="space-between" mb={3}>
            <Icon as={icon} boxSize={6} color={`${tone}.500`} />
            {trend !== undefined && (
              <Badge colorPalette={trend > 0 ? 'green' : 'red'}>
                <HStack gap={1}>
                  <Stat.DownIndicator />
                  <Text>{Math.abs(trend)}%</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          <Stat.ValueText fontSize="3xl" fontWeight="bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Stat.ValueText>
          <Stat.Label fontSize="sm" color="gray.500" mt={2}>
            {label}
          </Stat.Label>
        </Stat.Root>
      </Box>
    </MotionBox>
  );
}

export default function AdminAnalytics({ blogSlug }: AdminAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchAnalytics();
  }, [blogSlug]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogSlug}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <Box p={6} textAlign="center">
        <Text>Loading analytics...</Text>
      </Box>
    );
  }

  const engagementScore = Math.round(
    ((analytics.upvotes + analytics.comments * 2) / analytics.unique_views) * 100
  );

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      mt={6}
    >
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <Icon as={FaChartLine} boxSize={6} color="purple.500" />
            <Text fontSize="2xl" fontWeight="bold">
              Admin Analytics
            </Text>
          </HStack>
          <Badge colorPalette="purple" fontSize="md" px={3} py={1}>
            Admin Only
          </Badge>
        </HStack>

        <Separator />

        {/* Main Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <GridItem>
            <StatCard
              label="Total Views"
              value={analytics.total_views}
              icon={FaEye}
              trend={analytics.view_trend}
              colorPalette="blue"
            />
          </GridItem>
          <GridItem>
            <StatCard
              label="Unique Visitors"
              value={analytics.unique_views}
              icon={FaUsers}
              colorPalette="green"
            />
          </GridItem>
          <GridItem>
            <StatCard
              label="Upvotes"
              value={analytics.upvotes}
              icon={FaArrowUp}
              colorPalette="green"
            />
          </GridItem>
          <GridItem>
            <StatCard
              label="Downvotes"
              value={analytics.downvotes}
              icon={FaArrowDown}
              colorPalette="red"
            />
          </GridItem>
          <GridItem>
            <StatCard
              label="Comments"
              value={analytics.comments}
              icon={FaComment}
              colorPalette="purple"
            />
          </GridItem>
          <GridItem>
            <StatCard
              label="Downloads"
              value={analytics.downloads}
              icon={FaDownload}
              colorPalette="orange"
            />
          </GridItem>
        </Grid>

        {/* Performance Metrics */}
        <Box
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={6}
          borderRadius="lg"
        >
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Performance Metrics
            </Text>

            {/* Net Score */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Net Vote Score</Text>
                <Badge
                  colorPalette={analytics.net_score > 0 ? 'green' : 'red'}
                  fontSize="md"
                >
                  {analytics.net_score > 0 ? '+' : ''}
                  {analytics.net_score}
                </Badge>
              </HStack>
              <Progress.Root
                value={Math.abs(analytics.net_score)}
                max={Math.max(analytics.upvotes, analytics.downvotes) || 1}
                colorPalette={analytics.net_score > 0 ? 'green' : 'red'}
                size="sm"
                borderRadius="full">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>

            {/* Engagement Rate */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Engagement Score</Text>
                <Badge colorPalette="purple" fontSize="md">
                  {engagementScore}%
                </Badge>
              </HStack>
              <Progress.Root
                value={engagementScore}
                max={100}
                colorPalette="purple"
                size="sm"
                borderRadius="full">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>

            {/* Comment Rate */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Comment Rate</Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {((analytics.comments / analytics.unique_views) * 100).toFixed(1)}%
                </Text>
              </HStack>
              <Progress.Root
                value={(analytics.comments / analytics.unique_views) * 100}
                max={100}
                colorPalette="blue"
                size="sm"
                borderRadius="full">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </VStack>
        </Box>

        {/* Tabs for detailed data */}
        <Tabs.Root variant='enclosed' colorPalette="blue">
          <Tabs.List>
            <Tab>Traffic Sources</Tab>
            <Tab>User Breakdown</Tab>
            <Tab>Hourly Views</Tab>
          </Tabs.List>

          <TabPanels>
            {/* Traffic Sources */}
            <TabPanel>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Referrer</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign='end'>Views</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign='end'>%</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {analytics.top_referrers.map((ref, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>{ref.source || 'Direct'}</Table.Cell>
                      <Table.Cell textAlign='end'>{ref.count}</Table.Cell>
                      <Table.Cell textAlign='end'>
                        {((ref.count / analytics.total_views) * 100).toFixed(1)}%
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </TabPanel>

            {/* User Breakdown */}
            <TabPanel>
              <VStack gap={4}>
                <HStack width="full" justify="space-between">
                  <Text>Logged In Users</Text>
                  <Badge colorPalette="green" fontSize="lg">
                    {analytics.user_breakdown.logged_in}
                  </Badge>
                </HStack>
                <Progress.Root
                  value={analytics.user_breakdown.logged_in}
                  max={analytics.unique_views}
                  colorPalette="green"
                  size="md"
                  width="full">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                <HStack width="full" justify="space-between">
                  <Text>Anonymous Users</Text>
                  <Badge colorPalette="gray" fontSize="lg">
                    {analytics.user_breakdown.anonymous}
                  </Badge>
                </HStack>
                <Progress.Root
                  value={analytics.user_breakdown.anonymous}
                  max={analytics.unique_views}
                  colorPalette="gray"
                  size="md"
                  width="full">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </VStack>
            </TabPanel>

            {/* Hourly Views */}
            <TabPanel>
              <VStack gap={2} align="stretch">
                {analytics.hourly_views.map((hourData) => (
                  <HStack key={hourData.hour} justify="space-between">
                    <Text fontSize="sm" width="80px">
                      {hourData.hour}:00
                    </Text>
                    <Progress.Root
                      value={hourData.count}
                      max={Math.max(...analytics.hourly_views.map((h) => h.count))}
                      flex={1}
                      size="sm"
                      colorPalette="blue">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="sm" width="60px" textAlign="right">
                      {hourData.count}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
