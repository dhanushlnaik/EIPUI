import { Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
import React, { useState, useMemo } from 'react';
import { useColorModeValue } from "../ui/color-mode";
import { Steps, Box, Heading, Text, Flex, Button, Table, Avatar, Badge, Input, HStack, IconButton } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { FiDownload, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import axios from 'axios';

interface EditorComparisonTableProps {
  data: any;
  timePeriod: string;
  repository: string;
}

const EditorComparisonTable: React.FC<EditorComparisonTableProps> = ({
  data,
  timePeriod,
  repository,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerColor = useColorModeValue('#2b6cb0', '#4FD1FF');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('totalReviews');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [csvData, setCsvData] = useState([]);

  const allPersonnel = [
    ...(data?.editors || []).map((e: any) => ({ ...e, type: 'Editor' })),
    ...(data?.reviewers || []).map((r: any) => ({ ...r, type: 'Reviewer' })),
  ];

  const filteredAndSorted = useMemo(() => {
    let filtered = allPersonnel.filter((person: any) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a: any, b: any) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [allPersonnel, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDownload = async () => {
    try {
      const formatted = filteredAndSorted.map((person: any, index: number) => ({
        Rank: index + 1,
        Name: person.name,
        Type: person.type,
        'Total Reviews': person.totalReviews,
        'EIPs': person.eips || 0,
        'ERCs': person.ercs || 0,
        'RIPs': person.rips || 0,
        'Approval Rate (%)': person.approvalRate,
        'Avg Response Time (hours)': person.avgResponseTime,
        'Last Activity': person.lastActivity,
        'Active Days': person.activeDays,
        'Merged PRs': person.mergedPRs,
      }));
      setCsvData(formatted as any);
      await axios.post('/api/DownloadCounter');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />;
  };

  return (
    <Box
      bg={cardBg}
      p={{ base: 4, md: 5 }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'center' }} gap={4} mb={4}>
        <Box>
          <Heading size="lg" fontWeight="bold" color={headerColor}>
            Detailed Comparison Table
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Compare all editors and reviewers side-by-side
          </Text>
        </Box>
        <HStack>
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="200px"
            size="md"
          />
          <CSVLink
            data={csvData}
            filename={`editor-comparison-${timePeriod}-${repository}.csv`}
            onClick={handleDownload}
          >
            <Button size="md" colorPalette="blue"><FiDownload />Export
                          </Button>
          </CSVLink>
        </HStack>
      </Flex>
      <Box overflowX="auto">
        <Table.Root variant="simple" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Rank</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader cursor="pointer" onClick={() => handleSort('totalReviews')}>
                <HStack gap={1}>
                  <Text>Reviews</Text>
                  <SortIcon field="totalReviews" />
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader>EIPs</Table.ColumnHeader>
              <Table.ColumnHeader>ERCs</Table.ColumnHeader>
              <Table.ColumnHeader>RIPs</Table.ColumnHeader>
              <Table.ColumnHeader cursor="pointer" onClick={() => handleSort('approvalRate')}>
                <HStack gap={1}>
                  <Text>Approval %</Text>
                  <SortIcon field="approvalRate" />
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader cursor="pointer" onClick={() => handleSort('avgResponseTime')}>
                <HStack gap={1}>
                  <Text>Avg Response</Text>
                  <SortIcon field="avgResponseTime" />
                </HStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader>Last Activity</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredAndSorted.map((person: any, index: number) => (
              <Table.Row key={person.name} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                <Table.Cell>
                  <Badge colorPalette={index < 3 ? 'yellow' : 'blue'}>
                    #{index + 1}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Avatar.Root size="xs"><Avatar.Fallback name={person.name} /><Avatar.Image src={`https://github.com/${person.name}.png?size=40`} /></Avatar.Root>
                    <Text fontWeight="medium">{person.name}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={person.type === 'Editor' ? 'purple' : 'green'}>
                    {person.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell fontWeight="semibold">{person.totalReviews}</Table.Cell>
                <Table.Cell>{person.eips || 0}</Table.Cell>
                <Table.Cell>{person.ercs || 0}</Table.Cell>
                <Table.Cell>{person.rips || 0}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={person.approvalRate > 70 ? 'green' : 'yellow'}>
                    {person.approvalRate}%
                  </Badge>
                </Table.Cell>
                <Table.Cell>{person.avgResponseTime}h</Table.Cell>
                <Table.Cell fontSize="xs" color="gray.500">{person.lastActivity}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
      {filteredAndSorted.length === 0 && (
        <Flex justify="center" align="center" py={8}>
          <Text color="gray.500">No results found</Text>
        </Flex>
      )}
    </Box>
  );
};

export default EditorComparisonTable;
