import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, useColorModeValue, Spinner, Text } from "@chakra-ui/react";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import DateTime from "@/components/DateTime";
import Dashboard from "./Dashboard";
import NextLink from "next/link";

const getCat = (cat: string) => {
  switch (cat) {
    case "Standards Track" ||
      "Standard Track" ||
      "Standards Track (Core, Networking, Interface, ERC)" ||
      "Standard" ||
      "Process" ||
      "Core" ||
      "core":
      return "Core";
    case "ERC":
      return "ERCs";
    case "RIP":
      return "RIPs";
    case "Networking":
      return "Networking";
    case "Interface":
      return "Interface";
    case "Meta":
      return "Meta";
    case "Informational":
      return "Informational";
    default:
      return "Core";
  }
};

interface AreaProps {
  data: MappedDataItem[];
  xField: string;
  yField: string;
  color: string[];
  seriesField: string;
  xAxis: {
    range: number[];
    tickCount: number;
  };
  areaStyle: {
    fillOpacity: number;
  };
  legend: {
    position: string;
  };
  smooth: boolean;
}

interface MappedDataItem {
  category: string;
  date: string;
  value: number;
}

interface EIP {
  _id: string;
  eip: string;
  title: string;
  author: string;
  status: string;
  type: string;
  category: string;
  created: Date;
  discussion: string;
  deadline: string;
  requires: string;
  repo:string;
  unique_ID: number;
  __v: number;
}

interface FormattedEIP {
  category: string;
  date: string;
  value: number;
}

const categoryColors: string[] = [
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(54, 162, 235)",
  "rgb(153, 102, 255)",
  "rgb(255, 99, 255)",
  "rgb(50, 205, 50)",
  "rgb(255, 0, 0)",
  "rgb(0, 128, 0)",
];
const categoryBorder: string[] = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(255, 159, 64, 0.2)",
  "rgba(255, 205, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 99, 255, 0.2)",
  "rgba(50, 205, 50, 0.2)",
  "rgba(255, 0, 0, 0.2)",
  "rgba(0, 128, 0, 0.2)",
];

interface APIResponse {
  eip: EIP[];
  erc: EIP[];
  rip: EIP[];
}

interface ChartProps {
  type: string;
  dataset: APIResponse;
}

const AllChart: React.FC<ChartProps> = ({ type,dataset }) => {
  const [data, setData] = useState<EIP[]>([]);
  const bg = useColorModeValue("#f6f6f7", "#171923");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch(`/api/new/all`);
        // const dataset = await response.json();
        // const dataset=dataset;
        if (type === "EIP") {
          setData(dataset.eip);
        } else if (type === "ERC") {
          setData(dataset.erc);
        } else if (type === "RIP") {
          setData(dataset.rip);
        } else if (type === "Total") {
          setData(dataset.eip.concat(dataset.erc.concat(dataset.rip)));
        } else {
          setData(dataset.eip.concat(dataset.erc.concat(dataset.rip)));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  interface TransformedData {
    category: string;
    year: number;
    value: number;
  }
  
  const transformedData = data.reduce<TransformedData[]>((acc, item) => {
    const year = new Date(item.created).getFullYear();
    const category = item.repo === 'rip' ? 'RIPs' : getCat(item.category);
  
    // Check if a record for the same category and year already exists
    const existingEntry = acc.find((entry) => entry.year === year && entry.category === category);
  
    if (existingEntry) {
      // If it exists, increment the value
      existingEntry.value += 1;
    } else {
      // Otherwise, create a new entry
      acc.push({
        category: category,
        year: year,
        value: 1,
      });
    }
  
    return acc;
  }, []);
  
  
  


  const Area = dynamic(
    () => import("@ant-design/plots").then((item) => item.Column),
    {
      ssr: false,
    }
  );

  console.log(transformedData);

  const config = {
    data: transformedData,
    xField: "year",
    yField: "value",
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
    statistic: {
      title: false as const,
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
    slider: {
      start: 0,
      end: 1,
  },
    color: categoryColors,
    seriesField: "category",
    isStack: true,
    areaStyle: { fillOpacity: 0.6 },
    legend: { position: "top-right" as const },
    smooth: true,
    // label: {
    //   position: "middle",
    //   style: {
    //     fill: "#FFFFFF",
    //     opacity: 0.6,
    //   },
    // } as any,
    
  };
  
  
  

  return (
    <>
      {isLoading ? ( // Show loader while data is loading
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Spinner />
        </Box>
      ) : (
        <>
          <Box
            bgColor={bg}
            paddingX="0.5rem"
            borderRadius="0.55rem"
            _hover={{
              border: "1px",
              borderColor: "#30A0E0",
            }}
          >
            <NextLink
              href={
                type === "ERC"
                  ? "/erctable"
                  : type === "EIP"
                  ? "/eiptable"
                  : type === "RIP"
                  ? "/riptable"
                  : "/alltable"
              }
            >
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="#30A0E0"
                className="text-left"
                paddingY={4}
                paddingLeft={4}
                display="flex"
                flexDirection="column"
              >
                {type === 'Total'
    ? `All EIPs [${data.length}]`
    : `${type} - [${data.length}]`}
              </Text>
            </NextLink>
            <Box
            width={"100%"}       // Make the container full width
            minWidth={"100px"}  // Set a minimum width
            height={400}
            overflowX="auto"     // Enable horizontal scrolling if necessary
            overflowY="hidden"
            as={motion.div}
            padding={"2 rem"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5 }}
          >
            <Area {...config} />
            <Box className={"w-full"}>
              <DateTime />
            </Box>
          </Box>

          </Box>
        </>
      )}
    </>
  );
};

export default AllChart;
