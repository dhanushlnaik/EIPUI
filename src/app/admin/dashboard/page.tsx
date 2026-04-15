"use client";
import { Stat, Checkbox, Divider, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Progress } from "@/components/ui/compat";

import { TabList, Tab, TabPanels, TabPanel, InputLeftElement, Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
import { useToast } from "@/components/ui/use-toast";
;
import { useEffect, useState } from 'react';
import { useColorModeValue } from "../../../components/ui/color-mode";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AllLayout from '@/components/Layout';
import { Steps, Box, Button, Container, Heading, HStack, VStack, Table, Badge, IconButton, Spinner, Text, Flex, Icon, Input, InputGroup, NativeSelect, Menu, Tabs, Grid, SimpleGrid, Avatar, Portal } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { FaFileAlt, FaEye, FaEyeSlash, FaSignOutAlt, FaFilter, FaDatabase, FaFile, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaCalendar, FaTag, FaStar } from 'react-icons/fa';
import {
  LuChevronDown,
  LuDownload,
  LuEye,
  LuPencil,
  LuPlus,
  LuSearch,
  LuStar,
  LuTrash2,
} from 'react-icons/lu';

interface Blog {
  id: string;
  slug: string;
  title: string;
  author: string;
  category?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  isStatic?: boolean;
  summary?: string;
  reading_time?: number;
  featured?: boolean;
  tags?: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'database' | 'static'>('all');
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date');
  const { open, onOpen, onClose } = useDisclosure();
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    avgReadingTime: 0,
    recentActivity: 0,
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/session');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchBlogs = async () => {
    try {
      const [dbResponse, staticResponse] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/blogs/static')
      ]);
      
      const dbBlogs = dbResponse.ok ? (await dbResponse.json()).blogs : [];
      const staticBlogs = staticResponse.ok ? (await staticResponse.json()).posts : [];
      
      const allBlogs = [...dbBlogs, ...staticBlogs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setBlogs(allBlogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Blog deleted',
          status: 'success',
          duration: 3000,
        });
        fetchBlogs();
      } else {
        toast({
          title: 'Delete failed',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
    fetchBlogs();
  }, []);

  if (!mounted) {
    return null;
  }

  // Advanced filter and search with view mode
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'published' && blog.published) ||
      (filterStatus === 'draft' && !blog.published);
    
    const matchesViewMode = 
      viewMode === 'all' ||
      (viewMode === 'database' && !blog.isStatic) ||
      (viewMode === 'static' && blog.isStatic);
    
    return matchesSearch && matchesFilter && matchesViewMode;
  });

  // Sort blogs
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const databaseBlogs = blogs.filter(b => !b.isStatic);
  const staticBlogs = blogs.filter(b => b.isStatic);
  const featuredBlogs = blogs.filter(b => b.featured);

  if (loading) {
    return (
      <AllLayout>
        <Container maxW="container.xl" py={10}>
          <Flex justify="center" align="center" minH="50vh">
            <Spinner size="xl" color="blue.500" borderWidth="4px" />
          </Flex>
        </Container>
      </AllLayout>
    );
  }

  return (
    <AllLayout>
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg">Blog Admin Dashboard</Heading>
              {user && (
                <Text color="gray.600" fontSize="sm" mt={1}>
                  Welcome, {user.email}
                </Text>
              )}
            </Box>
            <HStack gap={3}>
              <Link href="/Blogs" passHref>
                <Button as="a" variant="outline"><LuEye />View Site
                                  </Button>
              </Link>
              <Button colorPalette="red" onClick={handleLogout}><Icon as={FaSignOutAlt} />Logout
                              </Button>
            </HStack>
          </Flex>

          {/* Enhanced Stats Grid */}
          <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={4}>
            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Total Blogs</Stat.Label>
              <Stat.ValueText fontSize="2xl">{blogs.length}</Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaFileAlt} color="blue.500" mr={1} />
                All content
              </Stat.HelpText>
            </Stat.Root>

            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Database</Stat.Label>
              <Stat.ValueText fontSize="2xl" color="purple.500">
                {databaseBlogs.length}
              </Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaDatabase} color="purple.500" mr={1} />
                Editable
              </Stat.HelpText>
            </Stat.Root>

            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Static Files</Stat.Label>
              <Stat.ValueText fontSize="2xl" color="gray.500">
                {staticBlogs.length}
              </Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaFile} color="gray.500" mr={1} />
                Read-only
              </Stat.HelpText>
            </Stat.Root>

            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Published</Stat.Label>
              <Stat.ValueText fontSize="2xl" color="green.500">
                {blogs.filter((b) => b.published).length}
              </Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaCheckCircle} color="green.500" mr={1} />
                Live now
              </Stat.HelpText>
            </Stat.Root>

            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Drafts</Stat.Label>
              <Stat.ValueText fontSize="2xl" color="orange.500">
                {blogs.filter((b) => !b.published).length}
              </Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaExclamationTriangle} color="orange.500" mr={1} />
                Pending
              </Stat.HelpText>
            </Stat.Root>

            <Stat.Root
              bg={bgColor}
              p={4}
              borderRadius="xl"
              boxShadow="md"
              border="1px"
              borderColor={borderColor}
            >
              <Stat.Label fontSize="xs">Featured</Stat.Label>
              <Stat.ValueText fontSize="2xl" color="yellow.500">
                {featuredBlogs.length}
              </Stat.ValueText>
              <Stat.HelpText>
                <Icon as={FaStar} color="yellow.500" mr={1} />
                Highlighted
              </Stat.HelpText>
            </Stat.Root>
          </SimpleGrid>

          {/* Search and Filter Bar */}
          <Box
            bg={bgColor}
            p={4}
            borderRadius="xl"
            boxShadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <VStack gap={4} align="stretch">
              <Flex gap={4} wrap="wrap" align="center" justify="space-between">
                <InputGroup maxW="500px" flex={1}>
                  <InputLeftElement>
                    <Icon as={LuSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by title, author, slug, summary..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="md"
                  />
                </InputGroup>
                
                <HStack gap={3} wrap="wrap">
                  <Menu.Root>
                    <Menu.Trigger asChild><Button size="md" variant="outline"><Icon as={FaFilter} />
                        {filterStatus === 'all' ? 'All Status' : filterStatus === 'published' ? 'Published' : 'Drafts'}
                        <LuChevronDown /></Button></Menu.Trigger>
                    <Portal><Menu.Positioner><Menu.Content>
                          <Menu.Item
                            icon={<FaFileAlt />}
                            onSelect={() => setFilterStatus('all')}
                            value='item-0'>
                            All Status
                          </Menu.Item>
                          <Menu.Item
                            icon={<FaCheckCircle />}
                            onSelect={() => setFilterStatus('published')}
                            value='item-1'>
                            Published Only
                          </Menu.Item>
                          <Menu.Item
                            icon={<FaExclamationTriangle />}
                            onSelect={() => setFilterStatus('draft')}
                            value='item-2'>
                            Drafts Only
                          </Menu.Item>
                        </Menu.Content></Menu.Positioner></Portal>
                  </Menu.Root>

                  <Menu.Root>
                    <Menu.Trigger asChild><Button size="md" variant="outline">Sort: {sortBy === 'date' ? 'Date' : sortBy === 'title' ? 'Title' : 'Author'}
                        <LuChevronDown /></Button></Menu.Trigger>
                    <Portal><Menu.Positioner><Menu.Content>
                          <Menu.Item icon={<FaCalendar />} onSelect={() => setSortBy('date')} value='item-3'>
                            By Date
                          </Menu.Item>
                          <Menu.Item icon={<FaFileAlt />} onSelect={() => setSortBy('title')} value='item-4'>
                            By Title
                          </Menu.Item>
                          <Menu.Item icon={<FaTag />} onSelect={() => setSortBy('author')} value='item-5'>
                            By Author
                          </Menu.Item>
                        </Menu.Content></Menu.Positioner></Portal>
                  </Menu.Root>
                  
                  <Link href="/admin/dashboard/new" passHref>
                    <Button as="a" colorPalette="blue" size="md"><LuPlus />New Blog
                                          </Button>
                  </Link>
                </HStack>
              </Flex>

              {/* Quick View Mode Tabs */}
              <HStack gap={2}>
                <Button
                  size="sm"
                  variant={viewMode === 'all' ? 'solid' : 'ghost'}
                  colorPalette={viewMode === 'all' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('all')}><Icon as={FaFileAlt} />All ({blogs.length})
                                  </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'database' ? 'solid' : 'ghost'}
                  colorPalette={viewMode === 'database' ? 'purple' : 'gray'}
                  onClick={() => setViewMode('database')}><Icon as={FaDatabase} />Database ({databaseBlogs.length})
                                  </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'static' ? 'solid' : 'ghost'}
                  colorPalette={viewMode === 'static' ? 'gray' : 'gray'}
                  onClick={() => setViewMode('static')}><Icon as={FaFile} />Static ({staticBlogs.length})
                                  </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Results Count & Info */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack>
              <Heading size="md">
                Blog Posts ({sortedBlogs.length})
              </Heading>
              {(searchTerm || filterStatus !== 'all' || viewMode !== 'all') && (
                <Badge colorPalette="blue">Filtered</Badge>
              )}
            </HStack>
            <HStack gap={4} fontSize="sm" color="gray.600">
              {searchTerm && (
                <Text>
                  Showing {sortedBlogs.length} of {blogs.length} total
                </Text>
              )}
              <Text>
                {viewMode === 'all' ? 'All Sources' : viewMode === 'database' ? 'Database Only' : 'Static Only'}
              </Text>
            </HStack>
          </Flex>

          {/* Blogs Table */}
          <Box
            bg={bgColor}
            borderRadius="xl"
            boxShadow="md"
            border="1px"
            borderColor={borderColor}
            overflowX="auto"
          >
            {sortedBlogs.length === 0 ? (
              <Box p={10} textAlign="center">
                <VStack gap={3}>
                  <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                  <Text color="gray.500" fontWeight="medium" fontSize="lg">
                    {searchTerm || filterStatus !== 'all' || viewMode !== 'all'
                      ? 'No blogs match your filters'
                      : 'No blog posts yet. Create your first one!'}
                  </Text>
                  {(searchTerm || filterStatus !== 'all' || viewMode !== 'all') && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="blue"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setViewMode('all');
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </VStack>
              </Box>
            ) : (
              <Table.Root variant="simple" size="md">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Title</Table.ColumnHeader>
                    <Table.ColumnHeader>Author</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Reading</Table.ColumnHeader>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign='end'>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedBlogs.map((blog) => (
                    <Table.Row key={blog.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Table.Cell>
                        <VStack align="start" gap={1}>
                          <HStack gap={2}>
                            {blog.featured && (
                              <Tooltip content="Featured">
                                <Icon as={FaStar} color="yellow.500" boxSize={4} />
                              </Tooltip>
                            )}
                            <Text fontWeight="medium" fontSize="sm">{blog.title}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {blog.slug}
                          </Text>
                          {blog.summary && (
                            <Text fontSize="xs" color="gray.400" lineClamp={1}>
                              {blog.summary}
                            </Text>
                          )}
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{blog.author}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={blog.isStatic ? 'gray' : 'purple'}
                          fontSize="xs"
                          variant="subtle"
                        >
                          {blog.isStatic ? 'Static' : 'Database'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {blog.category && (
                          <Badge colorPalette="blue" fontSize="xs">{blog.category}</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={blog.published ? 'green' : 'orange'}
                          fontSize="xs"
                          variant="subtle"
                        >
                          {blog.published ? 'Published' : 'Draft'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {blog.reading_time ? (
                          <HStack gap={1}>
                            <Icon as={FaClock} boxSize={3} color="gray.500" />
                            <Text fontSize="xs">{blog.reading_time} min</Text>
                          </HStack>
                        ) : (
                          <Text fontSize="xs" color="gray.400">—</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign='end'>
                        <HStack justify="flex-end" gap={2}>
                          {blog.isStatic ? (
                            <>
                              <Link href={`/Blogs/${blog.slug}`} passHref>
                                <IconButton
                                  as="a"
                                  aria-label="View"
                                  size="sm"
                                  colorPalette="blue"
                                  variant="ghost"
                                  target="_blank"><LuEye /></IconButton>
                              </Link>
                              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                Read-only
                              </Text>
                            </>
                          ) : (
                            <>
                              <Link href={`/admin/dashboard/edit/${blog.id}`} passHref>
                                <IconButton as="a" aria-label="Edit" size="sm" colorPalette="blue" variant="ghost"><LuPencil /></IconButton>
                              </Link>
                              <IconButton
                                aria-label="Delete"
                                size="sm"
                                colorPalette="red"
                                variant="ghost"
                                onClick={() => handleDelete(blog.id)}><LuTrash2 /></IconButton>
                            </>
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Box>
        </VStack>
      </Container>
    </AllLayout>
  );
}
