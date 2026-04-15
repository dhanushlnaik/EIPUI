import { Stat } from "@/components/ui/compat";
import React from "react";
import { useColorModeValue } from "./ui/color-mode";
import { Steps, Box, Icon, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

interface AnalyticsStatCardProps {
  label: string;
  value: number | string;
  helpText?: string;
  icon?: IconType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  colorScheme?: string;
}

const AnalyticsStatCard: React.FC<AnalyticsStatCardProps> = ({
  label,
  value,
  helpText,
  icon,
  trend,
  trendValue,
  colorScheme = "blue",
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const iconBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.200`);

  const getTrendColor = () => {
    if (trend === "up") return "green.500";
    if (trend === "down") return "red.500";
    return "gray.500";
  };

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      _hover={{
        boxShadow: "lg",
        transform: "translateY(-4px)",
      }}
      transition="all 0.3s"
    >
      <Flex justify="space-between" align="start">
        <Stat.Root>
          <Stat.Label fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
            {label}
          </Stat.Label>
          <Stat.ValueText fontSize="3xl" fontWeight="bold" mb={1}>
            {value}
          </Stat.ValueText>
          {(helpText || trendValue) && (
            <Stat.HelpText mb={0} fontSize="sm">
              {trendValue && (
                <Box as="span" color={getTrendColor()} fontWeight="semibold" mr={2}>
                  {trendValue}
                </Box>
              )}
              {helpText}
            </Stat.HelpText>
          )}
        </Stat.Root>
        {icon && (
          <Flex
            bg={iconBg}
            p={3}
            borderRadius="lg"
            align="center"
            justify="center"
          >
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default AnalyticsStatCard;
