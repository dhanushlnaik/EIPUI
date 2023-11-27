import AllLayout from "@/components/Layout";
import { Box, Button, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import FlexBetween from "@/components/FlexBetween";
import Header from "@/components/Header";
import { DownloadIcon } from "@chakra-ui/icons";
import TableStatus from "@/components/TableStatus";
import AreaStatus from "@/components/AreaStatus";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoaderComponent from "@/components/Loader";
import ERCGraph from "@/components/ERCGraph";
import NextLink from "next/link";
import StatusColumnChart from "@/components/StatusColumnChart";
import DateTime from "@/components/DateTime";
import SearchBox from "@/components/SearchBox";
import ERCCatBoxGrid from "@/components/ERCCatBoxGrid";
import ERCStatusDonut from "@/components/ERCStatusDonut";
import StackedColumnChart from "@/components/StackedBarChart";
import CBoxStatus from "@/components/CBoxStatus";
import AllChart from "@/components/AllChart";
import AreaC from "@/components/AreaC";
import ERCStatusGraph from "@/components/ERCStatusGraph";
interface EIP {
  _id: string;
  eip: string;
  title: string;
  author: string;
  status: string;
  type: string;
  category: string;
  created: string;
  discussion: string;
  deadline: string;
  requires: string;
  unique_ID: number;
  __v: number;
}

interface APIResponse {
  eip: EIP[];
  erc: EIP[];
}

const ERC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<EIP[]>([]); // Set initial state as an empty array
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/new/all`);
        console.log(response);
        const jsonData = await response.json();
        setData(jsonData.erc);
        setIsLoading(false); // Set loader state to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loader state to false even if an error occurs
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Simulating a loading delay
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup function
    return () => clearTimeout(timeout);
  }, []);
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
          <Box className="ml-40 mr-40 pl-10 pr-10 mt-10 mb-20">
            <FlexBetween>
              <Header
                title={`Ethereum Request for Comment - [ ${data.length} ]`}
                subtitle="ERCs describe application-level standard for the Ethereum ecosystem."
              />
            </FlexBetween>
            <Text className="text-red-400">
              The data before Oct 25 2023 is missing due to EIP ERC split. It
              will be here soon!
            </Text>
            <Box className={"w-full pt-4"}>
              <SearchBox />
            </Box>
            <Box className="grid grid-cols-2 pt-8 gap-x-5">
              <Box>
                <ERCStatusDonut />
              </Box>
              <Box>
                <AllChart type="ERC" />
              </Box>
            </Box>
            {/* <TableStatus cat="ERC" /> */}
            <Box>
              <AreaC type={"ERCs"} />
            </Box>
            <Box className={"pt-8"}>
              <Text fontSize="3xl" fontWeight="bold" color="#30A0E0">
                Draft vs Final
              </Text>
              <AreaStatus type={"ERCs"} />
            </Box>
            <Box paddingY={8}>
              <ERCStatusGraph />
            </Box>
          </Box>
        </motion.div>
      )}
    </AllLayout>
  );
};

export default ERC;
