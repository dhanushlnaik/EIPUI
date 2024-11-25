import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, useColorModeValue, Spinner } from "@chakra-ui/react";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import DateTime from "@/components/DateTime";

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
  status: string;
  eips: {
    status: string;
    month: number;
    year: number;
    date: string;
    count: number;
    category: string;
    eips:any[];
  }[];
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

interface AreaCProps {
  dataset: APIResponse;
  status: string;
  type: string;
}
interface APIResponse {
  eip: EIP[];
  erc: EIP[];
  rip: EIP[];
}

const StackedColumnChart: React.FC<AreaCProps> = ({ dataset, status, type }) => {
  const [data, setData] = useState<APIResponse>();
  const windowSize = useWindowSize();
  const bg = useColorModeValue("#f6f6f7", "#171923");
  const [isLoading, setIsLoading] = useState(true);
  console.log(dataset);
  console.log(status);
  console.log(type);

  const [typeData, setTypeData] = useState<EIP[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData = dataset;
        setData(jsonData);
        if (type === "EIPs" && jsonData.eip) {
          setTypeData(
            jsonData.eip.filter((item: any) => item.category !== "ERCs")
          );
          console.log(jsonData.eip.filter((item: any) => item.category !== "ERCs"));
        } else if (type === "ERCs" && jsonData.erc) {
          setTypeData(jsonData.erc);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dataset]);

  useEffect(() => {
    if (type === "EIPs") {
      setTypeData(data?.eip || []);
    } else if (type === "ERCs") {
      setTypeData(data?.erc || []);
    }
  });

  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    setIsChartReady(true);
  }, []);

  const filteredData = typeData.filter((item) => item.status === status);
  console.log(data);
  console.log(typeData)
  console.log(filteredData)

  const transformedData = filteredData
    .flatMap((item) =>
      item.eips.map((eip) => ({
        category: getCat(eip.category),
        year: eip.year.toString(),
        value: eip.count,
      }))
    )
    .filter((item) => item.category !== "ERCs");
    console.log(transformedData);
  
  const Area = dynamic(
    () => import("@ant-design/plots").then((item) => item.Column),
    {
      ssr: false,
    }
  );

  const chartWidth = windowSize.width
    ? Math.min(windowSize.width * 0.6, 500)
    : "100%";
  const chartHeight = windowSize.height
    ? Math.min(windowSize.height * 0.6, 500)
    : "100%";

  const config = {
    data: transformedData,
    xField: "year",
    yField: "value",
    color: categoryColors,
    seriesField: "category",
    isStack: true,
    areaStyle: { fillOpacity: 0.6 },
    legend: { position: "top-right" as const },
    smooth: true,
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    } as any,
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
        <Box
          bgColor={bg}
          marginTop={"2rem"}
          p="0.5rem"
          borderRadius="0.35rem"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={400}
          overflowX="auto"
          overflowY="hidden"
          as={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 } as any}
          className="hover: cursor-pointer ease-in duration-200 h-max"
        >
          <Area {...config} />
          <Box className={"w-full"}>
            <DateTime />
          </Box>
        </Box>
      )}
    </>
  );
};

export default StackedColumnChart;
