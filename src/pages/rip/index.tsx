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
import RIPStatusDonut from "@/components/RIPStatusDonut";
import StackedColumnChart from "@/components/StackedBarChart";
import CBoxStatus from "@/components/CBoxStatus";
import AllChart from "@/components/AllChart";
import AreaC from "@/components/AreaC";
import RIPStatusGraph from "@/components/RIPStatusGraph";
import OtherBox from "@/components/OtherStats";
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

const RIP = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<EIP[]>([]); // Set initial state as an empty array
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/new/all`);
        console.log(response);
        const jsonData = await response.json();
        setData(jsonData.rip);
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
  <Box className="mx-4 sm:mx-10 md:mx-20 mt-10 mb-20">
    <FlexBetween>
      <Header
        title={`Rolling Improvement Proposal - [ ${data.length} ]`}
        subtitle="ERCs describe application-level standard for the Ethereum ecosystem."
      />
    </FlexBetween>

    <Box className="w-full pt-4">
      <SearchBox />
    </Box>

    <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 pt-8 gap-5">
      <Box>
        <RIPStatusDonut />
      </Box>
      <Box>
        <AllChart type="RIP" />
      </Box>
      <Box className="h-fit">
        <OtherBox type="RIPs" />
      </Box>
    </Box>

    <Box paddingY={8}>
      <RIPStatusGraph />
    </Box>
  </Box>
</motion.div>

      )}
    </AllLayout>
  );
};

export default RIP;
