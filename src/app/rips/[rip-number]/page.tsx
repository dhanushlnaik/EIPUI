"use client";
import { Thead, Tr, Th, Td } from "@/components/ui/compat";
;
import { usePathname } from "next/navigation";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { useState, useEffect, useCallback } from "react";
import AllLayout from "@/components/Layout";
import NLink from "next/link";
import { motion } from "framer-motion";
import React from "react";
import CloseableAdCard from "@/components/CloseableAdCard";
import SearchBox from "@/components/SearchBox";
import { Steps, Container, Box, Table, Link, HStack, Flex, Text, VStack, Spinner, IconButton, Heading, Button, Popover, Icon } from "@chakra-ui/react";
import { Markdown } from "@/components/MarkdownEIP";
import Header from "@/components/Header2";
import LoaderComponent from "@/components/Loader";
import SingleSubscriptionButton from "@/components/SingleSubscriptionButton";

import { LuChevronDown, LuChevronUp, LuInfo } from 'react-icons/lu';

interface EipMetadataJson {
  eip: number;
  title: string;
  description: string;
  author: string[];
  "discussions-to": string;
  "last-call-deadline": string;
  status: string;
  type: string;
  category: string;
  created: string;
  requires: number[];
}

const TestComponent = () => {
  const path = usePathname();
  const pathArray = path?.split("/") || [];
  const RIPNo = extractRIPNo(pathArray);
  const [markdownFileURL, setMarkdownFileURL] = useState<string>("");
  const [metadataJson, setMetadataJson] = useState<EipMetadataJson>();
  const [markdown, setMarkdown] = useState<string>("");
  const [data, setData] = useState<{ status: string; date: string }[]>([]);
  const [data2, setData2] = useState<{ type: string; date: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataNotFound, setIsDataNotFound] = useState(false);
  const [show, setShow] = useState(false); // State to toggle visibility
  const toggleCollapse = () => setShow(!show);
  const [show2, setShow2] = useState(false); // State to toggle visibility
  const toggleCollapse2 = () => setShow2(!show2);

  useEffect(() => {
    if (RIPNo) {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/new/riphistory/${RIPNo}`);
          const jsonData = await response.json();
          const statusWithDates = extractLastStatusDates(jsonData);
          const typeWithDates = extractLastTypesDates(jsonData);
          setData(statusWithDates);
          setData2(typeWithDates);
          console.log(statusWithDates);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [RIPNo]);

  const fetchEIPData = useCallback(async () => {
    if (!RIPNo) return;

    let _markdownFileURL = `https://raw.githubusercontent.com/ethereum/RIPs/master/RIPS/rip-${RIPNo}.md`;
    setMarkdownFileURL(_markdownFileURL);

    try {
      const eipMarkdownRes = await fetch(_markdownFileURL).then((response) =>
        response.text()
      );

      const { metadata, markdown: _markdown } = extractMetadata(eipMarkdownRes);
      const metadataJson = convertMetadataToJson(metadata);

      // Check if necessary fields are missing
      if (!metadataJson?.author || !metadataJson?.created) {
        setIsDataNotFound(true);
      } else {
        setMetadataJson(metadataJson);
        setMarkdown(_markdown);
        setIsDataNotFound(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching ERC data:", error);
    }
  }, [RIPNo]);

  useEffect(() => {
    if (RIPNo) {
      fetchEIPData();
    }
  }, [fetchEIPData, RIPNo]);
  const statusOrder = [
    "Draft",
    "Review",
    "Living",
    "Stagnant",
    "Last Call",
    "Withdrawn",
    "Final",
  ];

  const boxBg = useColorModeValue("gray.100", "gray.700");
  const boxTextColor = useColorModeValue("gray.800", "gray.200");
  const statusColor = useColorModeValue("blue.600", "cyan.400");
  const dateColor = useColorModeValue("gray.600", "gray.300");
  const boxShadow = useColorModeValue("md", "dark-lg");


  return (
    <>
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoaderComponent />
          </motion.div>
        </Box>
      ) : isDataNotFound ? (
        <AllLayout>
          <Box
            textAlign="center"
            py={6}
            px={6}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <Heading size="lg" mb={4}>
              RIP Not Found
            </Heading>
            <Text color="gray.500" fontSize="xl" mb={6}>
              This RIP might not exist or could be an <Link color="blue.300" href={`/eips/eip-${RIPNo}`}>EIP</Link> or <Link color="blue.300" href={`/ercs/erc-${RIPNo}`}>ERC</Link>. Please check again.
            </Text>
            <br />
            <SearchBox />
            <br />
            <Button
              colorPalette="blue"
              size="lg"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </Box>
        </AllLayout>
      ) : (
        <AllLayout>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              paddingBottom={{ lg: "10", sm: "10", base: "10" }}
              marginX={{ lg: "40", md: "2", sm: "2", base: "2" }}
              paddingX={{ lg: "10", md: "5", sm: "5", base: "5" }}
              marginTop={{ lg: "10", md: "5", sm: "5", base: "5" }}
            >
              <Header
                title={`RIP- ${RIPNo}`}
                subtitle={metadataJson?.title || ""}
              />
              <Box overflowX="auto">
                <Table.Root variant="simple">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Authors</Table.ColumnHeader>
                      <Table.Cell>{metadataJson?.author?.join(", ")}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.ColumnHeader>Created</Table.ColumnHeader>
                      <Table.Cell>{metadataJson?.created}</Table.Cell>
                    </Table.Row>
                    {metadataJson?.["discussions-to"] && (
                      <Table.Row>
                        <Table.ColumnHeader>Discussion Link</Table.ColumnHeader>
                        <Table.Cell>
                          <Link
                            href={metadataJson["discussions-to"]}
                            color="blue.400"
                            target='_blank'
                            rel='noopener noreferrer'>
                            {metadataJson["discussions-to"]}
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    )}

                    {metadataJson?.requires &&
                      metadataJson.requires?.length > 0 && (
                        <Table.Row>
                          <Table.ColumnHeader>Requires</Table.ColumnHeader>
                          <Table.Cell>
                            <HStack>
                              {metadataJson.requires?.map((req, i) => (
                                <NLink key={i} href={`/eips/eip-${req}`}>
                                  <Text
                                    color="blue.400"
                                    _hover={{ textDecor: "underline" }}
                                  >
                                    {"EIP"}-{req}
                                  </Text>
                                </NLink>
                              ))}
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    {metadataJson?.status && (
                      <Table.Row>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.Cell>{metadataJson?.status}</Table.Cell>
                      </Table.Row>
                    )}
                    {metadataJson?.["last-call-deadline"] && (
                      <Table.Row>
                        <Table.ColumnHeader>Last Call Deadline</Table.ColumnHeader>
                        <Table.Cell>{metadataJson["last-call-deadline"]}</Table.Cell>
                      </Table.Row>
                    )}

                    {metadataJson?.type && (
                      <Table.Row>
                        <Table.ColumnHeader>Type</Table.ColumnHeader>
                        <Table.Cell>{metadataJson?.type}</Table.Cell>
                      </Table.Row>
                    )}
                    {metadataJson?.category && (
                      <Table.Row>
                        <Table.ColumnHeader>category</Table.ColumnHeader>
                        <Table.Cell>{metadataJson?.category}</Table.Cell>
                      </Table.Row>
                    )}
                    <Table.Row>
                      <Table.ColumnHeader>Get Updates</Table.ColumnHeader>
                      <Table.Cell>
                        <SingleSubscriptionButton type="rips" id={RIPNo} />
                      </Table.Cell>
                    </Table.Row>

                  </Table.Header>
                </Table.Root>
              </Box>



              <Box bg={useColorModeValue('lightgray', 'darkgray')} p="5" borderRadius="md" mt="1">
                <Flex justify="space-between" align="center">
                  {/* Heading on the Left */}
                  <Heading id="timeline" size="md" color={"#30A0E0"}>
                    Status Timeline

                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <IconButton aria-label="More info" size="md" colorPalette="blue" variant="ghost"><LuInfo /></IconButton>
                      </Popover.Trigger>
                      <Popover.Positioner>
                        <Popover.Content>
                          <Popover.Arrow />
                          <Popover.CloseTrigger />
                          <Popover.Title>Instructions</Popover.Title>
                          <Popover.Body>
                            The timeline tracks status changes using the merged date as the reference point.
                          </Popover.Body>
                        </Popover.Content>
                      </Popover.Positioner>
                    </Popover.Root>

                  </Heading>

                  {/* Dropdown Button on the Right */}
                  <Box
                    bg="blue" // Gray background
                    borderRadius="md" // Rounded corners
                    padding={2} // Padding inside the box
                  >
                    <IconButton
                      onClick={toggleCollapse}
                      variant="ghost"
                      // Smaller height
                      h="24px"
                      w="20px"
                      aria-label="Toggle Status Timeline"
                      // Background color on hover
                      _hover={{ bg: 'blue' }}
                      // Background color when active
                      _active={{ bg: 'blue' }}
                      // Remove focus outline
                      _focus={{ boxShadow: 'none' }}>{show ? <Icon as={LuChevronUp} boxSize={8} color="white" /> : <Icon as={LuChevronDown} boxSize={8} color="white" />}</IconButton>
                  </Box>
                </Flex>

                {/* Status Timeline - This is shown only when `show` is true */}
                {show && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Flex w="100%" gap={6} align="center" flexWrap="wrap" mt="4">
                      {data
                        ?.filter((item) => statusOrder.includes(item.status)) // Filter out any unexpected statuses
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
                        ?.map((item, index, sortedData) => {
                          const currentDate = new Date(item.date);
                          const nextItem = sortedData[index + 1];
                          const nextDate = nextItem ? new Date(nextItem.date) : null;

                          // Calculate the day difference between current and next item
                          const dayDifference = nextDate
                            ? Math.abs(Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)))
                            : null;

                          return (
                            <React.Fragment key={index}>
                              {/* Status and Date */}
                              <VStack align="center" gap={3} minW="120px" maxW="120px" mb={4}>
                                <Box
                                  p="5"
                                  bg={useColorModeValue("white", "gray.800")}
                                  borderRadius="md"
                                  boxShadow={useColorModeValue("md", "dark-lg")}
                                  textAlign="center"
                                  minH="80px"
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                >
                                  <Text fontWeight="bold" color={statusColor}>
                                    {item.status}
                                  </Text>
                                  <Text color={dateColor}>
                                    {currentDate.toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </Text>
                                </Box>
                              </VStack>
                              {/* Arrow design and days difference */}
                              {nextItem && (
                                <VStack align="center" gap={1}>
                                  <Box
                                    h="1px"
                                    w="80px"
                                    borderBottom="1px solid"
                                    borderColor="gray.400"
                                    position="relative"
                                  >
                                    {/* Arrow pointing forward */}
                                    <Box
                                      position="absolute"
                                      right="-10px"
                                      top="-4px"
                                      borderTop="5px solid transparent"
                                      borderBottom="5px solid transparent"
                                      borderLeft="10px solid gray"
                                    />
                                  </Box>
                                  <Text color="gray.500" fontSize="sm">
                                    {dayDifference} days
                                  </Text>
                                </VStack>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </Flex>
                  </motion.div>
                )}
              </Box>

              {data2?.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Box bg={useColorModeValue('lightgray', 'darkgray')} p="5" borderRadius="md" mt="1">
                    {/* Heading on the Left */}
                    <Flex justify="space-between" align="center">
                      <Heading size="md" color={"#30A0E0"}>
                        Type Timeline
                      </Heading>

                      {/* Dropdown Button on the Right */}
                      <Box
                        bg="blue" // Gray background
                        borderRadius="md" // Rounded corners
                        padding={2} // Padding inside the box
                      >
                        <IconButton
                          onClick={toggleCollapse2}
                          variant="ghost"
                          // Smaller height
                          h="24px"
                          w="20px"
                          aria-label="Toggle Type Timeline"
                          // Background color on hover
                          _hover={{ bg: 'blue' }}
                          // Background color when active
                          _active={{ bg: 'blue' }}
                          // Remove focus outline
                          _focus={{ boxShadow: 'none' }}>{show2 ? <Icon as={LuChevronUp} boxSize={8} color="white" /> : <Icon as={LuChevronDown} boxSize={8} color="white" />}</IconButton>
                      </Box>
                    </Flex>

                    {/* Type Timeline - This is shown only when `show` is true */}
                    {show2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <Flex w="100%" gap={6} align="center" flexWrap="wrap" mt="4">
                          {data2
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
                            ?.map((item, index, sortedData) => {
                              const currentDate = new Date(item.date);
                              const nextItem = sortedData[index + 1];
                              const nextDate = nextItem ? new Date(nextItem.date) : null;

                              // Calculate the day difference between current and next item
                              const dayDifference = nextDate
                                ? Math.abs(Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)))
                                : null;

                              return (
                                <React.Fragment key={index}>
                                  {/* Type and Date */}
                                  <VStack align="center" gap={3} minW="120px" maxW="120px" mb={4}>
                                    <Box
                                      p="5"
                                      bg={useColorModeValue("white", "gray.800")}
                                      borderRadius="md"
                                      boxShadow={useColorModeValue("md", "dark-lg")}
                                      textAlign="center"
                                      minH="80px"
                                      display="flex"
                                      flexDirection="column"
                                      justifyContent="center"
                                    >
                                      <Text fontWeight="bold" color={statusColor}>
                                        {item.type}
                                      </Text>
                                      <Text color={dateColor}>
                                        {currentDate.toLocaleDateString("en-US", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </Text>
                                    </Box>
                                  </VStack>
                                  {/* Arrow design and days difference */}
                                  {nextItem && (
                                    <VStack align="center" gap={1}>
                                      <Box
                                        h="1px"
                                        w="80px"
                                        borderBottom="1px solid"
                                        borderColor="gray.400"
                                        position="relative"
                                      >
                                        {/* Arrow pointing forward */}
                                        <Box
                                          position="absolute"
                                          right="-10px"
                                          top="-4px"
                                          borderTop="5px solid transparent"
                                          borderBottom="5px solid transparent"
                                          borderLeft="10px solid gray"
                                        />
                                      </Box>
                                      <Text color="gray.500" fontSize="sm">
                                        {dayDifference} days
                                      </Text>
                                    </VStack>
                                  )}
                                </React.Fragment>
                              );
                            })}
                        </Flex>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              )}
              
              {/* EtherWorld Advertisement */}
              <Box my={6}>
                {/* <CloseableAdCard /> */}
              </Box>
              
              <Container maxW="1200px" mx="auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Markdown md={markdown} markdownFileURL={markdownFileURL} />
                  <br />
                </motion.div>
              </Container>
            </Box>
          </motion.div>
        </AllLayout>
      )}
    </>
  );
};

const extractRIPNo = (data: any) => {
  return data[2]?.split("-")[1];
};

const extractLastStatusDates = (data: any) => {
  const statusDates: Record<string, string> = {};

  Object.keys(data)?.forEach((key) => {
    let laststatus = "";
    if (key !== "repo") {
      const { status, mergedDate } = data[key];
      if (status === "unknown") {
        return;
      }
      if (laststatus !== status) {
        statusDates[status] = mergedDate;
      }
      laststatus = status;
    }
  });

  return Object.keys(statusDates)?.map((status) => ({
    status,
    date: statusDates[status],
  }));
};

const extractLastTypesDates = (data: any) => {
  const typeDates: { type: string; date: string }[] = [];
  const standardTrackTypes = [
    "Standards Track",
    "Standard Track",
    "Standards Track (Core, Networking, Interface, ERC)",
    "Standard"
  ];
  let lasttype = "";
  const sortedData = Object.keys(data)
    ?.filter((key) => key !== "repo")
    .sort((a, b) => new Date(data[a].mergedDate).getTime() - new Date(data[b].mergedDate).getTime());

  sortedData?.forEach((key) => {
    let { type, mergedDate } = data[key];

    if (type === "unknown") {
      return;
    }
    if (standardTrackTypes.includes(type)) {
      type = "Standards Track"
    }

    if (lasttype !== type) {
      typeDates.push({ type, date: mergedDate });
    }

    lasttype = type;
  });

  return typeDates;
};


const extractMetadata = (text: string) => {
  const regex = /(--|---)\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/;
  const match = text.match(regex);

  if (match) {
    return {
      metadata: match[2],
      markdown: match[3],
    };
  } else {
    return {
      metadata: "",
      markdown: text,
    };
  }
};

const convertMetadataToJson = (metadataText: string): EipMetadataJson => {
  const lines = metadataText.split("\n");
  const jsonObject: any = {};

  lines?.forEach((line) => {
    const [key, value] = line.split(/: (.+)/);
    if (key && value) {
      if (key.trim() === "rip") {
        jsonObject[key.trim()] = parseInt(value.trim());
      } else if (key.trim() === "requires") {
        jsonObject[key.trim()] = value.split(",")?.map((v) => parseInt(v));
      } else if (key.trim() === "author") {
        jsonObject[key.trim()] = value
          .split(",")
          ?.map((author: string) => author.trim());
      } else {
        jsonObject[key.trim()] = value.trim();
      }
    }
  });

  return jsonObject as EipMetadataJson;
};

export default TestComponent;
