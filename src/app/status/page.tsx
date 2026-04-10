"use client";

import React from "react";
import CloseableAdCard from "@/components/CloseableAdCard";
import AllLayout from "@/components/Layout";
import Header from "@/components/Header";
import {
  Box,
  Flex,
  Grid,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import CBoxStatus from "@/components/CBoxStatus2";
import Donut from "@/components/Donut";
import DonutStatus from "@/components/DonutStatus";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoaderComponent from "@/components/Loader";
// import StackedColumnChart from "@/components/StackedBarChart";
import StackedColumnChart from "@/components/DraftBarChart2";
import { PieC } from "@/components/InPie";
import AreaStatus from "@/components/AreaStatus2";
import Banner from "@/components/NewsBanner";
import NextLink from "next/link";
import AreaC from "@/components/AreaC";
import { client } from "@/lib/orpc";

interface EIP {
  _id: string;
  eip: string;
  title: string | null;
  author: string | null;
  status: string;
  type: string;
  category: string;
  created: string | Date | null;
  discussion?: string | null;
  deadline?: string | null;
  requires?: string | null;
  unique_ID?: number;
  __v?: number;
  repo?: "eip" | "erc" | "rip";
}

interface APIResponse {
  eip: EIP[];
  erc: EIP[];
  rip: EIP[];
}

interface EIP2 {
  status: string;
  eips: {
    status: string;
    month: number;
    year: number;
    date: string;
    count: number;
    category: string;
    eips: any[];
    repo?: "eip" | "erc" | "rip";
  }[];
}


const Status = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [data, setData] = useState<EIP[]>([]);
  const [data2, setData2] = useState<APIResponse>();
  const [data3, setData3] = useState<EIP2[]>([]);

  const normalizeGraphRows = (rows: any[]): EIP2[] =>
    (rows || []).map((row) => ({
      status: row.status,
      eips: (row.eips || []).map((entry: any) => ({
        ...entry,
        status: entry.status || row.status,
      })),
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const graphPromise = fetch(`/api/new/graphsv2`).then((res) => res.json());
        const allPromise = client.home.getAllProposals();
        const graphRpcPromise = client.home.getStatusTimelineV2();

        const [allRpcResult, graphRpcResult, graphJson] = await Promise.allSettled([
          allPromise,
          graphRpcPromise,
          graphPromise,
        ]);

        if (allRpcResult.status === "fulfilled") {
          setData2(allRpcResult.value);
        } else {
          const allRes = await fetch(`/api/new/all`);
          const allJson: APIResponse = await allRes.json();
          setData2(allJson);
        }

        if (graphRpcResult.status === "fulfilled") {
          const graphData = graphRpcResult.value;
          setData3(normalizeGraphRows(graphData.eip?.concat(graphData.erc?.concat(graphData.rip)) || []));
        } else if (graphJson.status === "fulfilled") {
          const graphData = graphJson.value;
          setData3(normalizeGraphRows(graphData.eip?.concat(graphData.erc?.concat(graphData.rip)) || []));
        } else {
          setData3([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const allData: EIP[] = data2?.eip?.concat(data2?.erc?.concat(data2?.rip)) || [];

  let filteredData1 = data3?.filter((item) => item.status === "Draft");
  let filteredData2 = data3?.filter((item) => item.status === "Review");
  let filteredData3 = data3?.filter((item) => item.status === "Last Call");
  let filteredData4 = data3?.filter((item) => item.status === "Living");
  let filteredData5 = data3?.filter((item) => item.status === "Final");
  let filteredData6 = data3?.filter((item) => item.status === "Stagnant");
  let filteredData7 = data3?.filter((item) => item.status === "Withdrawn");
  return (
    <AllLayout>
      {isLoading ? ( // Check if the data is still loading
        // Show loader if data is loading
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
            {/* Your loader component */}
            <LoaderComponent />
          </motion.div>
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
           display={{ lg: "block", md: "block", sm: "block", base: "block" }}
            paddingBottom={{ lg: "6", sm: "6", base: "6" }}
            marginX={{ lg: "20", md: "2", sm: "2", base: "2" }}
            paddingX={{ lg: "8", md: "4", sm: "4", base: "4" }}
            marginTop={{ lg: "6", md: "4", sm: "4", base: "4" }}
          >
            <Header title="Status" subtitle="Your Roadway to Status" description="" />

            {/* EtherWorld Advertisement */}
            <Box my={6}>
              {/* <CloseableAdCard /> */}
            </Box>

            <Text
              fontSize="3xl" fontWeight="bold" color="#30A0E0"
            >
              <div id="draft-vs-final"> Draft vs Final {" "} </div>
            </Text>

            <AreaStatus/>
            
            {/* <AreaC type={"EIPs"} /> */}

            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="draft">Draft -{" "}
              <NextLink href={`/tableStatus/Draft`}>
                {" "}
                [ {allData?.filter((item) => item.status === "Draft")?.length} ]
              </NextLink>
</div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Draft" dataset={filteredData1}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Draft" dataset={filteredData1}/>
                </Box>
              </Flex>
            </Box>
            
              
            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="review">Review -{" "}
              <NextLink href={`/tableStatus/Review`}>
                {" "}
                [ {allData?.filter((item) => item.status === "Review")?.length} ]
              </NextLink>
</div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Review" dataset={filteredData2}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Review" dataset={filteredData2}/>
                </Box>
              </Flex>
            </Box>
            
            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="lastcall">Last Call -
              <NextLink href={`/tableStatus/LastCall`}>
                {" "}
                [ {allData?.filter((item) => item.status ===  "Last Call")?.length
                } ]{" "}
              </NextLink>
              </div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Last Call" dataset={filteredData3}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Last Call" dataset={filteredData3}/>
                </Box>
              </Flex>
            </Box>
            
            
            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="final">Final -
              <NextLink href={`/tableStatus/Final`}>
                {" "}
                [ {allData?.filter((item) => item.status === "Final")?.length
                } ]{" "}
              </NextLink>
              </div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Final" dataset={filteredData5}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Final" dataset={filteredData5}/>
                </Box>
              </Flex>
            </Box>

            
            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="stagnant">Stagnant -
              <NextLink href={`/tableStatus/Stagnant`}>
                {" "}
                [ {allData?.filter((item) => item.status === "Stagnant")?.length
                } ]{" "}
              </NextLink>
              </div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Stagnant" dataset={filteredData6}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Stagnant" dataset={filteredData6} />
                </Box>
              </Flex>
            </Box>
            
            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="withdrawn">Withdrawn -
              <NextLink href={`/tableStatus/Withdrawn`}>
                {" "}
                [ {allData?.filter((item) => item.status ===  "Withdrawn")?.length
                } ]{" "}
              </NextLink>
              </div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Withdrawn" dataset={filteredData7}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Withdrawn" dataset={filteredData7}/>
                </Box>
              </Flex>
            </Box>

            <br/>
            <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
              <div id="living">Living -
              <NextLink href={`/tableStatus/Living`}>
                {" "}
                [ {allData?.filter((item) => item.status === "Living")?.length} ]
              </NextLink>
              </div>
            </Text>

            <Box paddingTop={"8"}>
               <Flex direction={{ base: "column", md: "row" }} gap="4" align="center">
                <Box flex="1">
                  <StackedColumnChart status="Living" dataset={filteredData4}/>
                </Box>
                <Box flex="1">
                  <CBoxStatus status="Living" dataset={filteredData4}/>
                </Box>
              </Flex>
            </Box>

          </Box>
        </motion.div>
      )}
    </AllLayout>
  );
};

export default Status;
