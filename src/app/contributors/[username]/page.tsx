"use client";
import { Stat } from "@/components/ui/compat";

import { TabList, Tab, TabPanels, TabPanel } from "@/components/ui/compat";
;
import React, { useState, useEffect } from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { Steps, Box, Container, Heading, Text, Avatar, Badge, Flex, Spinner, HStack, VStack, Card, Button, NativeSelect, Link, Icon, Grid, Tabs, Separator } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { FiGithub, FiTwitter, FiExternalLink, FiArrowLeft, FiTrendingUp, FiActivity, FiCalendar } from "react-icons/fi";
import type { Contributor, Activity, RepositoryStats } from "@/types/contributors";
import { ActivityCard } from "@/components/ActivityCard";
import AllLayout from "@/components/Layout";
import { ActivityDistributionChart } from "@/components/contributors/ActivityDistributionChart";
import { ActivityTimelineChart } from "@/components/contributors/ActivityTimelineChart";
import RepositoryBreakdownChart from "@/components/contributors/RepositoryBreakdownChart";
import { ContributorHeatmap } from "@/components/contributors/ContributorHeatmap";

export default function ContributorDetailPage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [activityType, setActivityType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (username) {
      fetchContributor();
      fetchAnalytics();
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchActivities();
    }
  }, [username, selectedRepo, activityType, page]);

  useEffect(() => {
    if (username && selectedRepo) {
      fetchAnalytics();
    }
  }, [selectedRepo]);

  const fetchContributor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contributors/list?search=${username}&limit=1`);
      const data = await response.json();
      
      if (data.contributors && data.contributors.length > 0) {
        const contributor = data.contributors[0];
        const totalStats = {
          commits: contributor.repositoryStats.reduce((sum: number, s: RepositoryStats) => sum + (s.commits || 0), 0),
          pullRequests: contributor.repositoryStats.reduce(
            (sum: number, s: RepositoryStats) => sum + (s.prsOpened || 0) + (s.prsMerged || 0) + (s.prsClosed || 0),
            0
          ),
          reviews: contributor.repositoryStats.reduce((sum: number, s: RepositoryStats) => sum + (s.reviews || 0), 0),
          comments: contributor.repositoryStats.reduce((sum: number, s: RepositoryStats) => sum + (s.comments || 0), 0),
        };
        setContributor({ ...contributor, totalStats });
      }
    } catch (error) {
      console.error("Failed to fetch contributor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const params = new URLSearchParams({
        username: username as string,
        page: page.toString(),
        limit: "30",
      });

      if (selectedRepo) params.append("repository", selectedRepo);
      if (activityType) params.append("activityType", activityType);

      const response = await fetch(`/api/contributors/timeline?${params}`);
      const data = await response.json();

      setActivities(data.activities || []);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const params = new URLSearchParams({
        username: username as string,
      });
      if (selectedRepo) params.append("repository", selectedRepo);

      const response = await fetch(`/api/contributors/analytics?${params}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AllLayout>
        <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
          <Container maxW="container.xl">
            <Flex justify="center" py={20}>
              <Spinner size="xl" />
            </Flex>
          </Container>
        </Box>
      </AllLayout>
    );
  }

  if (!contributor) {
    return (
      <AllLayout>
        <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
          <Container maxW="container.xl">
            <Card.Root>
              <Card.Body>
                <Text textAlign="center" py={8}>
                  Contributor not found
                </Text>
                <Flex justify="center">
                  <NextLink href="/contributors" passHref legacyBehavior>
                    <Button as="a" colorPalette="blue">Back to Contributors</Button>
                  </NextLink>
                </Flex>
              </Card.Body>
            </Card.Root>
          </Container>
        </Box>
      </AllLayout>
    );
  }

  return (
    <AllLayout>
      <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack gap={8} align="stretch">
            <Button
              as={NextLink}
              href="/contributors"
              variant="ghost"
              alignSelf="flex-start"
              size="lg"><Icon as={FiArrowLeft} />Back to Contributors
                          </Button>

            <Card.Root
              bg={useColorModeValue("blue.50", "blue.950")}
              borderWidth="2px"
              borderColor={useColorModeValue("blue.200", "blue.900")}
              borderRadius="lg"
              overflow="hidden"
              shadow="sm"
            >
              <Card.Body p={8} bg={useColorModeValue("blue.50/30", "blue.950/20")}>
                <Flex gap={6} align="start" direction={{ base: "column", md: "row" }}>
                  <Avatar.Root size="2xl" border="4px solid white"><Avatar.Fallback name={contributor.username} /><Avatar.Image src={contributor.avatarUrl} /></Avatar.Root>
                  <VStack align="start" flex={1} gap={4}>
                    <Box>
                      <Heading size="2xl">{contributor.username}</Heading>
                      {contributor.name && (
                        <Text fontSize="lg" opacity={0.9}>
                          {contributor.name}
                        </Text>
                      )}
                    </Box>

                    {contributor.bio && (
                      <Text opacity={0.9} fontSize="md">{contributor.bio}</Text>
                    )}

                    <HStack gap={4} flexWrap="wrap">
                      {contributor.company && (
                        <Badge bg="whiteAlpha.300" color="white" px={3} py={1}>
                          🏢 {contributor.company}
                        </Badge>
                      )}
                      {contributor.location && (
                        <Badge bg="whiteAlpha.300" color="white" px={3} py={1}>
                          📍 {contributor.location}
                        </Badge>
                      )}
                    </HStack>

                    <HStack gap={4}>
                      <Link
                        href={`https://github.com/${contributor.username}`}
                        target='_blank'
                        rel='noopener noreferrer'>
                        <Button
                          size="sm"
                          bg="whiteAlpha.300"
                          color="white"
                          _hover={{ bg: "whiteAlpha.400" }}><Icon as={FiGithub} />GitHub
                                                  </Button>
                      </Link>
                      {contributor.twitterUsername && (
                        <Link
                          href={`https://twitter.com/${contributor.twitterUsername}`}
                          target='_blank'
                          rel='noopener noreferrer'>
                          <Button
                            size="sm"
                            bg="whiteAlpha.300"
                            color="white"
                            _hover={{ bg: "whiteAlpha.400" }}><Icon as={FiTwitter} />Twitter
                                                      </Button>
                        </Link>
                      )}
                      {contributor.blog && (
                        <Link href={contributor.blog} target='_blank' rel='noopener noreferrer'>
                          <Button
                            size="sm"
                            bg="whiteAlpha.300"
                            color="white"
                            _hover={{ bg: "whiteAlpha.400" }}><Icon as={FiExternalLink} />Website
                                                      </Button>
                        </Link>
                      )}
                    </HStack>
                  </VStack>

                  <VStack align="end">
                    <Badge bg="yellow.400" color="gray.900" fontSize="3xl" px={6} py={3} borderRadius="xl">
                      {contributor.totalScore}
                    </Badge>
                    <Text fontSize="sm" opacity={0.9}>
                      Total Score
                    </Text>
                  </VStack>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <Card.Root bgGradient="linear(to-br, blue.50, blue.100)" _dark={{ bgGradient: "linear(to-br, blue.900, blue.800)" }} borderWidth={2} borderColor="blue.200">
                <Card.Body>
                  <Stat.Root>
                    <HStack mb={2}>
                      <Icon as={FiActivity} color="blue.500" boxSize={5} />
                      <Stat.Label fontWeight="bold">Total Activities</Stat.Label>
                    </HStack>
                    <Stat.ValueText fontSize="3xl" color="blue.600" _dark={{ color: "blue.300" }}>{contributor.totalActivities}</Stat.ValueText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root bgGradient="linear(to-br, purple.50, purple.100)" _dark={{ bgGradient: "linear(to-br, purple.900, purple.800)" }} borderWidth={2} borderColor="purple.200">
                <Card.Body>
                  <Stat.Root>
                    <HStack mb={2}>
                      <Icon as={FiGithub} color="purple.500" boxSize={5} />
                      <Stat.Label fontWeight="bold">Repositories</Stat.Label>
                    </HStack>
                    <Stat.ValueText fontSize="3xl" color="purple.600" _dark={{ color: "purple.300" }}>{contributor.repositories.length}</Stat.ValueText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root bgGradient="linear(to-br, green.50, green.100)" _dark={{ bgGradient: "linear(to-br, green.900, green.800)" }} borderWidth={2} borderColor="green.200">
                <Card.Body>
                  <Stat.Root>
                    <HStack mb={2}>
                      <Icon as={FiCalendar} color="green.500" boxSize={5} />
                      <Stat.Label fontWeight="bold">First Activity</Stat.Label>
                    </HStack>
                    <Stat.ValueText fontSize="lg" color="green.600" _dark={{ color: "green.300" }}>
                      {contributor.firstActivityAt
                        ? formatDate(contributor.firstActivityAt).split(",")[0]
                        : "N/A"}
                    </Stat.ValueText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              <Card.Root bgGradient="linear(to-br, orange.50, orange.100)" _dark={{ bgGradient: "linear(to-br, orange.900, orange.800)" }} borderWidth={2} borderColor="orange.200">
                <Card.Body>
                  <Stat.Root>
                    <HStack mb={2}>
                      <Icon as={FiTrendingUp} color="orange.500" boxSize={5} />
                      <Stat.Label fontWeight="bold">Last Activity</Stat.Label>
                    </HStack>
                    <Stat.ValueText fontSize="lg" color="orange.600" _dark={{ color: "orange.300" }}>
                      {contributor.lastActivityAt
                        ? formatDate(contributor.lastActivityAt).split(",")[0]
                        : "N/A"}
                    </Stat.ValueText>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>
            </Grid>

          <Card.Root>
            <Card.Body>
              <Heading size="md" mb={4}>
                Repository Breakdown
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                {contributor.repositoryStats.map((stat) => (
                  <Box
                    key={stat.repository}
                    p={4}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <Text fontWeight="bold" mb={2}>
                      {stat.repository.split("/")[1]}
                    </Text>
                    <VStack align="start" gap={1} fontSize="sm">
                      <Text>Score: {stat.score}</Text>
                      <Text>Commits: {stat.commits}</Text>
                      <Text>Pull Requests: {(stat.prsOpened || 0) + (stat.prsMerged || 0) + (stat.prsClosed || 0)}</Text>
                      <Text>Reviews: {stat.reviews}</Text>
                      <Text>Comments: {stat.comments}</Text>
                    </VStack>
                  </Box>
                ))}
              </Grid>
            </Card.Body>
          </Card.Root>

            <Tabs.Root variant='enclosed' colorPalette="blue" size="lg">
              <Tabs.List>
                <Tab fontWeight="bold">📊 Analytics</Tab>
                <Tab fontWeight="bold">📋 Repository Stats</Tab>
                <Tab fontWeight="bold">⏱️ Activity Timeline</Tab>
              </Tabs.List>

              <TabPanels>
                <TabPanel px={0}>
                  <VStack gap={6}>
                    {analyticsLoading ? (
                      <Flex justify="center" py={8}>
                        <Spinner size="xl" />
                      </Flex>
                    ) : analytics ? (
                      <>
                        <Grid
                          templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                          gap={6}
                          w="full"
                        >
                          <ActivityTimelineChart
                            data={analytics.activityTimeline || []}
                          />
                          <ActivityDistributionChart
                            data={analytics.activityDistribution || []}
                          />
                        </Grid>
                        <Grid
                          templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                          gap={6}
                          w="full"
                        >
                          <RepositoryBreakdownChart
                            data={analytics.repositoryBreakdown || []}
                          />
                          <ContributorHeatmap
                            data={analytics.activityHeatmap || []}
                          />
                        </Grid>
                      </>
                    ) : (
                      <Text>No analytics data available</Text>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel px={0}>
                  <Card.Root>
                    <Card.Body>
                      <Heading size="md" mb={4}>
                        Repository Breakdown
                      </Heading>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                        {contributor.repositoryStats.map((stat) => (
                          <Box
                            key={stat.repository}
                            p={6}
                            borderWidth={2}
                            borderColor={borderColor}
                            borderRadius="lg"
                            bgGradient={
                              stat.repository.includes("EIPs")
                                ? "linear(to-br, blue.50, blue.100)"
                                : stat.repository.includes("ERCs")
                                ? "linear(to-br, purple.50, purple.100)"
                                : "linear(to-br, green.50, green.100)"
                            }
                            _dark={{
                              bgGradient: stat.repository.includes("EIPs")
                                ? "linear(to-br, blue.900, blue.800)"
                                : stat.repository.includes("ERCs")
                                ? "linear(to-br, purple.900, purple.800)"
                                : "linear(to-br, green.900, green.800)",
                            }}
                          >
                            <Text fontWeight="bold" fontSize="xl" mb={3}>
                              {stat.repository.split("/")[1]}
                            </Text>
                            <VStack align="start" gap={2} fontSize="sm">
                              <HStack justify="space-between" w="full">
                                <Text>Score:</Text>
                                <Badge colorPalette="purple" fontSize="md">{stat.score}</Badge>
                              </HStack>
                              <Separator />
                              <HStack justify="space-between" w="full">
                                <Text>Commits:</Text>
                                <Badge colorPalette="blue">{stat.commits}</Badge>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text>Pull Requests:</Text>
                                <Badge colorPalette="green">{(stat.prsOpened || 0) + (stat.prsMerged || 0) + (stat.prsClosed || 0)}</Badge>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text>Reviews:</Text>
                                <Badge colorPalette="orange">{stat.reviews}</Badge>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text>Comments:</Text>
                                <Badge colorPalette="cyan">{stat.comments}</Badge>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </Grid>
                    </Card.Body>
                  </Card.Root>
                </TabPanel>

                <TabPanel px={0} id="activity-timeline">
                  <Card.Root>
                    <Card.Body>
                      <Heading size="md" mb={4}>
                        Activity Timeline
                      </Heading>

                      <HStack gap={4} mb={4}>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={selectedRepo}
                            onValueChange={(e) => {
                              setSelectedRepo(e.target.value);
                              setPage(1);
                            }}
                            placeholder="All Repositories">
                            {contributor.repositories.map((repo) => (
                              <option key={repo} value={repo}>
                                {repo.split("/")[1]}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>

                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={activityType}
                            onValueChange={(e) => {
                              setActivityType(e.target.value);
                              setPage(1);
                            }}
                            placeholder="All Activity Types">
                            <option value="COMMIT">Commits</option>
                            <option value="PR_OPENED">PR Opened</option>
                            <option value="PR_MERGED">PR Merged</option>
                            <option value="REVIEW_APPROVED">Review Approved</option>
                            <option value="REVIEW_COMMENTED">Review Commented</option>
                            <option value="ISSUE_COMMENT">Issue Comments</option>
                            <option value="PR_COMMENT">PR Comments</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </HStack>

                      {activitiesLoading ? (
                        <Flex justify="center" py={8}>
                          <Spinner size="lg" />
                        </Flex>
                      ) : activities.length === 0 ? (
                        <Text textAlign="center" py={8} color="gray.500">
                          No activities found
                        </Text>
                      ) : (
                        <>
                          <VStack gap={3} align="stretch">
                            {activities.map((activity) => (
                              <ActivityCard key={activity._id} activity={activity} />
                            ))}
                          </VStack>

                          <Flex justify="center" gap={4} mt={6}>
                            <Button
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                              colorPalette="blue"
                            >
                              Previous
                            </Button>
                            <Text alignSelf="center" fontWeight="bold">Page {page}</Text>
                            <Button
                              onClick={() => setPage((p) => p + 1)}
                              disabled={!hasMore}
                              colorPalette="blue"
                            >
                              Next
                            </Button>
                          </Flex>
                        </>
                      )}
                    </Card.Body>
                  </Card.Root>
                </TabPanel>
              </TabPanels>
            </Tabs.Root>
          </VStack>
        </Container>
      </Box>
    </AllLayout>
  );
}
