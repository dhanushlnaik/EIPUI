"use client";
import { Stat } from "@/components/ui/compat";

import { Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
;
import React, { useState, useEffect } from 'react';
import { useColorModeValue } from "../../components/ui/color-mode";
import { Steps, Box, Container, Heading, Text, VStack, HStack, Table, Badge, Button, Spinner, Alert, SimpleGrid, Card, IconButton, Flex, NativeSelect, Input } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaUsers, 
  FaChartLine,
  FaRedo,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaMeh
} from 'react-icons/fa';
import AllLayout from '@/components/Layout';

interface EnhancedFeedback {
  _id: string;
  rating: 'positive' | 'neutral' | 'negative';
  comment?: string;
  page: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  timestamp: string;
}

interface SimpleFeedback {
  _id: string;
  type: 'like' | 'dislike';
  page: string;
  comment?: string;
  userAgent: string;
  ip: string;
  createdAt: string;
}

type CombinedFeedback = (EnhancedFeedback | SimpleFeedback) & {
  feedbackType?: 'simple' | 'enhanced';
  displayType?: 'like' | 'dislike' | 'neutral';
};

interface FeedbackStats {
  total: number;
  likes: number;
  dislikes: number;
  neutral?: number;
  likePercentage: number;
  satisfactionScore?: number;
}

interface FeedbackResponse {
  feedbacks: CombinedFeedback[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  stats: FeedbackStats;
}

const FeedbackDashboard = () => {
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true);
      
      // Fetch both simple and enhanced feedback
      const [simpleFeedbackRes, enhancedFeedbackRes] = await Promise.allSettled([
        fetch(`/api/Feedback/getAllFeedback?page=${page}&limit=25`),
        fetch(`/api/Feedback/getEnhancedFeedback?page=${page}&limit=25`)
      ]);
      
      let combinedData: FeedbackResponse = {
        feedbacks: [],
        pagination: { currentPage: page, totalPages: 1, totalCount: 0, limit: 50 },
        stats: { total: 0, likes: 0, dislikes: 0, neutral: 0, likePercentage: 0, satisfactionScore: 0 }
      };

      // Process simple feedback
      if (simpleFeedbackRes.status === 'fulfilled' && simpleFeedbackRes.value.ok) {
        const simpleData = await simpleFeedbackRes.value.json();
        const simpleFeedbacks = (simpleData.feedbacks || []).map((f: SimpleFeedback) => ({
          ...f,
          feedbackType: 'simple' as const,
          displayType: f.type,
          rating: f.type === 'like' ? 'positive' : 'negative'
        }));
        
        combinedData.feedbacks.push(...simpleFeedbacks);
        combinedData.stats.total += simpleData.stats?.total || 0;
        combinedData.stats.likes += simpleData.stats?.likes || 0;
        combinedData.stats.dislikes += simpleData.stats?.dislikes || 0;
      }

      // Process enhanced feedback
      if (enhancedFeedbackRes.status === 'fulfilled' && enhancedFeedbackRes.value.ok) {
        const enhancedData = await enhancedFeedbackRes.value.json();
        
        const enhancedFeedbacks = (enhancedData.feedbacks || []).map((f: EnhancedFeedback) => ({
          ...f,
          feedbackType: 'enhanced' as const,
          displayType: f.rating === 'positive' ? 'like' : f.rating === 'negative' ? 'dislike' : 'neutral'
        }));
        
        combinedData.feedbacks.push(...enhancedFeedbacks);
        combinedData.stats.total += enhancedData.stats?.total || 0;
        combinedData.stats.likes += enhancedData.stats?.positive || 0;
        combinedData.stats.dislikes += enhancedData.stats?.negative || 0;
        combinedData.stats.neutral = (combinedData.stats.neutral || 0) + (enhancedData.stats?.neutral || 0);
      }

      // Sort combined feedback by date
      combinedData.feedbacks.sort((a, b) => {
        const dateA = new Date(a.createdAt || ('timestamp' in a ? a.timestamp : new Date())).getTime();
        const dateB = new Date(b.createdAt || ('timestamp' in b ? b.timestamp : new Date())).getTime();
        return dateB - dateA;
      });

      // Calculate combined stats
      if (combinedData.stats.total > 0) {
        combinedData.stats.likePercentage = Math.round(
          (combinedData.stats.likes / combinedData.stats.total) * 100
        );
        
        // Calculate satisfaction score (positive = 100%, neutral = 50%, negative = 0%)
        const satisfactionPoints = (combinedData.stats.likes * 100) + ((combinedData.stats.neutral || 0) * 50);
        combinedData.stats.satisfactionScore = Math.round(satisfactionPoints / combinedData.stats.total);
      }

      combinedData.pagination.totalCount = combinedData.feedbacks.length;
      combinedData.pagination.totalPages = Math.ceil(combinedData.feedbacks.length / 50);

      setData(combinedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchFeedback(currentPage);
  };

  const exportToCSV = () => {
    if (!data?.feedbacks) return;
    
    const csvContent = [
      'Type,Rating,Page,Comment,User Agent,IP,Created At,Feedback System',
      ...data.feedbacks.map(f => {
        const rating = 'rating' in f ? f.rating : f.type;
        const displayRating = f.displayType || rating;
        return `${displayRating},"${rating}","${f.page || 'N/A'}","${f.comment || 'N/A'}","${f.userAgent}","${f.ip}","${f.createdAt}","${f.feedbackType}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combined-feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPageName = (url: string) => {
    if (!url || url === 'Unknown') return 'Unknown';
    try {
      const pathname = new URL(url).pathname;
      return pathname.split('/').pop() || pathname;
    } catch {
      return url.substring(0, 50) + (url.length > 50 ? '...' : '');
    }
  };

  const getBadgeProps = (feedback: CombinedFeedback) => {
    if (feedback.feedbackType === 'enhanced') {
      const enhancedFeedback = feedback as EnhancedFeedback;
      switch (enhancedFeedback.rating) {
        case 'positive':
          return { colorScheme: 'green', children: '👍 Positive' };
        case 'negative':
          return { colorScheme: 'red', children: '👎 Negative' };
        case 'neutral':
          return { colorScheme: 'orange', children: '😐 Neutral' };
      }
    } else {
      const simpleFeedback = feedback as SimpleFeedback;
      return simpleFeedback.type === 'like' 
        ? { colorScheme: 'green', children: '👍 Like' }
        : { colorScheme: 'red', children: '👎 Dislike' };
    }
  };

  if (loading && !data) {
    return (
      <AllLayout>
        <Container maxW="container.xl" py={8}>
          <VStack gap={8}>
            <Heading>📊 Combined Feedback Dashboard</Heading>
            <Spinner size="xl" />
          </VStack>
        </Container>
      </AllLayout>
    );
  }

  if (error) {
    return (
      <AllLayout>
        <Container maxW="container.xl" py={8}>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Error loading feedback data:</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        </Container>
      </AllLayout>
    );
  }

  return (
    <AllLayout>
      <Container maxW="container.xl" py={8}>
        <VStack gap={6}>
          {/* Header */}
          <Flex justify="space-between" align="center" width="100%">
            <VStack align="start" gap={1}>
              <Heading size="lg">📊 Enhanced Feedback Dashboard</Heading>
              <Text color="gray.600">Monitor user feedback and engagement (Simple + Enhanced)</Text>
            </VStack>
            <HStack>
              <Tooltip content="Test Discord Webhook">
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/test-discord-webhook', { method: 'POST' });
                      const data = await res.json();
                      alert(res.ok ? '✅ Discord webhook test successful!' : `❌ Test failed: ${data.message}`);
                    } catch (err) {
                      alert('❌ Test failed: Network error');
                    }
                  }}
                  colorPalette="purple"
                  size="sm"
                  variant="outline"><FaCalendarAlt />Test Discord
                                  </Button>
              </Tooltip>
              <Tooltip content="Export to CSV">
                <IconButton
                  aria-label="Export"
                  onClick={exportToCSV}
                  colorPalette="blue"
                  variant="outline"><FaDownload /></IconButton>
              </Tooltip>
              <Tooltip content="Refresh Data">
                <IconButton
                  aria-label="Refresh"
                  onClick={handleRefresh}
                  loading={loading}
                  colorPalette="green"><FaRedo /></IconButton>
              </Tooltip>
            </HStack>
          </Flex>

          {/* Statistics Cards */}
          {data?.stats && (
            <SimpleGrid columns={{ base: 2, md: 5 }} gap={4} width="100%">
              <Card.Root>
                <Card.Body>
                  <Stat.Root>
                    <HStack>
                      <Box color="blue.500">
                        <FaUsers size={20} />
                      </Box>
                      <Stat.Label>Total Feedback</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.total}</Stat.ValueText>
                    <Stat.HelpText>All systems</Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <Stat.Root>
                    <HStack>
                      <Box color="green.500">
                        <FaThumbsUp size={20} />
                      </Box>
                      <Stat.Label>Positive</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.likes}</Stat.ValueText>
                    <Stat.HelpText>{data.stats.likePercentage}%</Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <Stat.Root>
                    <HStack>
                      <Box color="orange.500">
                        <FaMeh size={20} />
                      </Box>
                      <Stat.Label>Neutral</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.neutral || 0}</Stat.ValueText>
                    <Stat.HelpText>Enhanced only</Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <Stat.Root>
                    <HStack>
                      <Box color="red.500">
                        <FaThumbsDown size={20} />
                      </Box>
                      <Stat.Label>Negative</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.dislikes}</Stat.ValueText>
                    <Stat.HelpText>{100 - data.stats.likePercentage}%</Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root>
                <Card.Body>
                  <Stat.Root>
                    <HStack>
                      <Box color="purple.500">
                        <FaChartLine size={20} />
                      </Box>
                      <Stat.Label>Satisfaction</Stat.Label>
                    </HStack>
                    <Stat.ValueText>
                      {data.stats.satisfactionScore || data.stats.likePercentage}%
                    </Stat.ValueText>
                    <Stat.HelpText>
                      <Badge colorPalette={
                        (data.stats.satisfactionScore || data.stats.likePercentage) > 70 ? 'green' : 
                        (data.stats.satisfactionScore || data.stats.likePercentage) > 50 ? 'yellow' : 'red'
                      }>
                        {(data.stats.satisfactionScore || data.stats.likePercentage) > 70 ? 'Excellent' : 
                         (data.stats.satisfactionScore || data.stats.likePercentage) > 50 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </Stat.HelpText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}

          {/* Filters */}
          <Card.Root width="100%">
            <Card.Header>
              <Heading size="md">🔍 Filters</Heading>
            </Card.Header>
            <Card.Body>
              <HStack gap={4}>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={filterType}
                    onValueChange={(e) => setFilterType(e.target.value)}
                    maxW="200px">
                    <option value="all">All Feedback</option>
                    <option value="like">👍 Positive Only</option>
                    <option value="neutral">😐 Neutral Only</option>
                    <option value="dislike">👎 Negative Only</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Input
                  placeholder="Filter by date (YYYY-MM-DD)"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  maxW="200px"
                />
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Feedback Table */}
          <Card.Root width="100%">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="md">📝 Recent Combined Feedback</Heading>
                <Text fontSize="sm" color="gray.500">
                  Showing {data?.feedbacks?.length || 0} items
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Box overflowX="auto">
                <Table.Root variant="simple">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Type</Table.ColumnHeader>
                      <Table.ColumnHeader>System</Table.ColumnHeader>
                      <Table.ColumnHeader>Page</Table.ColumnHeader>
                      <Table.ColumnHeader>Comment</Table.ColumnHeader>
                      <Table.ColumnHeader>User Agent</Table.ColumnHeader>
                      <Table.ColumnHeader>IP</Table.ColumnHeader>
                      <Table.ColumnHeader>Date</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data?.feedbacks
                      .filter(f => filterType === 'all' || f.displayType === filterType)
                      .filter(f => !dateFilter || f.createdAt.startsWith(dateFilter))
                      .slice(0, 50)
                      .map((feedback) => (
                      <Table.Row key={feedback._id}>
                        <Table.Cell>
                          <Badge 
                            {...getBadgeProps(feedback)}
                            variant="solid"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Badge 
                            colorPalette={feedback.feedbackType === 'enhanced' ? 'purple' : 'blue'}
                            variant="outline"
                          >
                            {feedback.feedbackType === 'enhanced' ? 'Enhanced' : 'Simple'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip content={feedback.page}>
                            <Text fontSize="sm" lineClamp={1} maxW="200px">
                              {getPageName(feedback.page)}
                            </Text>
                          </Tooltip>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" lineClamp={2} maxW="150px">
                            {feedback.comment || '-'}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip content={feedback.userAgent}>
                            <Text fontSize="xs" lineClamp={1} maxW="150px">
                              {feedback.userAgent.substring(0, 30)}...
                            </Text>
                          </Tooltip>
                        </Table.Cell>
                        <Table.Cell fontSize="sm">{feedback.ip}</Table.Cell>
                        <Table.Cell fontSize="sm">{formatDate(feedback.createdAt)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </AllLayout>
  );
};

export default FeedbackDashboard;
