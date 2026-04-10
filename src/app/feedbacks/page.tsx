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
  FaCalendarAlt
} from 'react-icons/fa';
import AllLayout from '@/components/Layout';

interface Feedback {
  _id: string;
  type: 'like' | 'dislike';
  page?: string; // Optional since older entries may not have this
  comment?: string;
  userAgent?: string; // Optional since older entries may not have this
  ip?: string; // Optional since older entries may not have this
  createdAt: string;
}

interface FeedbackStats {
  total: number;
  likes: number;
  dislikes: number;
  likePercentage: number;
}

interface FeedbackResponse {
  feedbacks: Feedback[];
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
      const response = await fetch(`/api/Feedback/getAllFeedback?page=${page}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      
      const result = await response.json();
      setData(result);
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
      'Type,Page,Comment,User Agent,IP,Created At',
      ...data.feedbacks.map(f => 
        `${f.type},"${f.page || 'N/A'}","${f.comment || 'N/A'}","${f.userAgent || 'N/A'}","${f.ip || 'N/A'}","${f.createdAt}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPageName = (url: string | undefined | null) => {
    if (!url || url === 'Unknown' || url === 'undefined') return 'Unknown Page';
    try {
      const pathname = new URL(url).pathname;
      const pageName = pathname.split('/').pop() || pathname;
      return pageName === '/' || pageName === '' ? 'Home' : pageName;
    } catch {
      // If URL parsing fails, return a shortened version of the string
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  };

  if (loading && !data) {
    return (
      <AllLayout>
        <Container maxW="container.xl" py={8}>
          <VStack gap={8}>
            <Heading>Feedback Dashboard</Heading>
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
              <Heading size="lg">📊 Feedback Dashboard</Heading>
              <Text color="gray.600">Monitor user feedback and engagement</Text>
            </VStack>
            <HStack>
              <Tooltip content="Export to CSV">
                <IconButton
                  aria-label="Export"
                  onClick={exportToCSV}
                  colorPalette="blue"
                  variant="outline"><FaDownload /></IconButton>
              </Tooltip>
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
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} width="100%">
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
                    <Stat.HelpText>All time</Stat.HelpText>
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
                      <Stat.Label>Likes</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.likes}</Stat.ValueText>
                    <Stat.HelpText>{data.stats.likePercentage}% positive</Stat.HelpText>
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
                      <Stat.Label>Dislikes</Stat.Label>
                    </HStack>
                    <Stat.ValueText>{data.stats.dislikes}</Stat.ValueText>
                    <Stat.HelpText>{100 - data.stats.likePercentage}% negative</Stat.HelpText>
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
                      {data.stats.likePercentage}%
                    </Stat.ValueText>
                    <Stat.HelpText>
                      <Badge colorPalette={data.stats.likePercentage > 70 ? 'green' : data.stats.likePercentage > 50 ? 'yellow' : 'red'}>
                        {data.stats.likePercentage > 70 ? 'Excellent' : data.stats.likePercentage > 50 ? 'Good' : 'Needs Improvement'}
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
                    <option value="like">👍 Likes Only</option>
                    <option value="dislike">👎 Dislikes Only</option>
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
                <Heading size="md">📝 Recent Feedback</Heading>
                <Text fontSize="sm" color="gray.500">
                  Page {data?.pagination.currentPage} of {data?.pagination.totalPages} 
                  ({data?.pagination.totalCount} total)
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Box overflowX="auto">
                <Table.Root variant="simple">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Type</Table.ColumnHeader>
                      <Table.ColumnHeader>Page</Table.ColumnHeader>
                      <Table.ColumnHeader>Comment</Table.ColumnHeader>
                      <Table.ColumnHeader>User Agent</Table.ColumnHeader>
                      <Table.ColumnHeader>IP</Table.ColumnHeader>
                      <Table.ColumnHeader>Date</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data?.feedbacks
                      .filter(f => filterType === 'all' || f.type === filterType)
                      .filter(f => !dateFilter || f.createdAt.startsWith(dateFilter))
                      .map((feedback) => (
                      <Table.Row key={feedback._id}>
                        <Table.Cell>
                          <Badge 
                            colorPalette={feedback.type === 'like' ? 'green' : 'red'}
                            variant="solid"
                          >
                            {feedback.type === 'like' ? '👍 Like' : '👎 Dislike'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip content={feedback.page || 'Unknown Page'}>
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
                          <Tooltip content={feedback.userAgent || 'Unknown Browser'}>
                            <Text fontSize="xs" lineClamp={1} maxW="150px">
                              {feedback.userAgent ? 
                                feedback.userAgent.substring(0, 30) + '...' : 
                                'Unknown Browser'}
                            </Text>
                          </Tooltip>
                        </Table.Cell>
                        <Table.Cell fontSize="sm">{feedback.ip || 'Unknown IP'}</Table.Cell>
                        <Table.Cell fontSize="sm">{formatDate(feedback.createdAt)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <HStack justify="center" mt={4}>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm">
                    Page {currentPage} of {data.pagination.totalPages}
                  </Text>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
                    disabled={currentPage === data.pagination.totalPages}
                    size="sm"
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </AllLayout>
  );
};

export default FeedbackDashboard;
