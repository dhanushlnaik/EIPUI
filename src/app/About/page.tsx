"use client";
;
import React, { useState } from "react";
import { useColorModeValue } from "../../components/ui/color-mode";
import AllLayout from "@/components/Layout";
import ContributorsGrid from "@/components/ContributorsGrid";
import FundingDetails from "@/components/FundingDetails";
import GrantList from "@/components/GrantList";
import Partners from "@/components/Partners";
import { Steps, Box, Container, Text, Link, Heading, SimpleGrid, Button, Collapsible, Icon, VStack, HStack, Badge, Separator } from "@chakra-ui/react";
import { 
  FaUsers, 
  FaChartLine, 
  FaTools, 
  FaDatabase, 
  FaComments, 
  FaGraduationCap,
  FaRocket,
  FaHeart
} from 'react-icons/fa';

export default function AboutPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFeaturesOverview, setShowFeaturesOverview] = useState(false);
  
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const linkColor = useColorModeValue("blue.600", "blue.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const gradientFrom = useColorModeValue("#30A0E0", "#4FD1FF");
  const gradientTo = useColorModeValue("#4FD1FF", "#7B61FF");

  const featuresList = [
    { icon: FaChartLine, title: 'Monthly Insight', desc: 'Follow the status changes of proposals under different types and categories with our beautiful charts and tables providing comprehensive details.', color: '#30A0E0' },
    { icon: FaTools, title: 'Advanced Toolings', desc: 'Make use of our different toolings such as "Editor Review Tracker" and "Issues and PRs Trackers" for comprehensive proposal management.', color: '#4FD1FF' },
    { icon: FaDatabase, title: 'Detailed EIP Database', desc: 'Explore our extensive database of EIPs, complete with detailed descriptions, statuses, and relevant discussions.', color: '#7B61FF' },
    { icon: FaComments, title: 'Expert Analysis', desc: 'We provide expert commentary and analysis on significant EIPs and their potential impacts on the Ethereum ecosystem.', color: '#FF6FD8' },
    { icon: FaUsers, title: 'Community Engagement', desc: 'Join our vibrant community of Ethereum enthusiasts, developers, and stakeholders in meaningful discussions.', color: '#2AC7FF' },
    { icon: FaGraduationCap, title: 'Educational Resources', desc: 'We offer comprehensive learning materials designed to help you understand the proposal process and technical details.', color: '#30A0E0' },
  ];

  return (
    <AllLayout>
      <style jsx>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .feature-icon {
          transition: transform 0.2s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.05);
        }
      `}</style>
      <Box
        w="full"
        bg={useColorModeValue("gray.50", "gray.900")}
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 6, lg: 8 }}
      >
        {/* Hero Section */}
        <VStack gap={4} align="stretch" maxW="100%">
          <Box
            bg={cardBg}
            p={{ base: 4, md: 6 }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow={useColorModeValue('sm', 'md')}
            _hover={{
              boxShadow: useColorModeValue('md', 'lg'),
              borderColor: accentColor
            }}
            transition="all 0.2s ease"
          >
            <VStack gap={3} align="start">
              <HStack gap={4}>
                <Icon as={FaRocket} boxSize={8} color={accentColor} />
                <Heading
                  as="h1"
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="800"
                  color={headingColor}
                  letterSpacing="tight"
                >
                  About EIPs Insights
                </Heading>
              </HStack>
              
              <Separator borderColor={borderColor} />

              <Text
                fontSize={{ base: "md", md: "lg" }}
                color={textColor}
                lineHeight="base"
              >
                We specialize in tools designed to provide clear, visual insights into the activity of{" "}
                <Link
                  href="https://github.com/ethereum/EIPs"
                  color={linkColor}
                  fontWeight="600"
                  _hover={{ color: accentColor }}
                  transition="color 0.2s"
                  target='_blank'
                  rel='noopener noreferrer'>
                  Ethereum Improvement Proposals (EIPs)
                </Link>,{" "}
                <Link
                  href="https://github.com/ethereum/ERCs"
                  color={linkColor}
                  fontWeight="600"
                  _hover={{ color: accentColor }}
                  transition="color 0.2s"
                  target='_blank'
                  rel='noopener noreferrer'>
                  Ethereum Request for Comments (ERCs)
                </Link>, and{" "}
                <Link
                  href="https://github.com/ethereum/RIPs"
                  color={linkColor}
                  fontWeight="600"
                  _hover={{ color: accentColor }}
                  transition="color 0.2s"
                  target='_blank'
                  rel='noopener noreferrer'>
                  Rollup Improvement Proposals (RIPs)
                </Link>. Our platform tracks progress and workload distribution among EIP Editors.
              </Text>
              <Button
                onClick={() => setShowFeaturesOverview(!showFeaturesOverview)}
                size="md"
                colorPalette="blue"
                variant={showFeaturesOverview ? "outline" : "solid"}><Icon as={FaHeart} />{showFeaturesOverview ? 'Hide Features' : 'View Features'}</Button>
            </VStack>
          </Box>

          {/* Features Grid */}
          <Collapsible.Root open={showFeaturesOverview}>
            <Collapsible.Content>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
                  {featuresList.map((feature, index) => (
                  <Box
                    key={feature.title}
                    className="feature-card"
                    bg={cardBg}
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                    boxShadow={useColorModeValue('sm', 'md')}
                    cursor="pointer"
                    onClick={() => setExpanded(expanded === feature.title ? null : feature.title)}
                    _hover={{
                      bg: hoverBg,
                      borderColor: accentColor
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack align="start" gap={2}>
                      <Icon 
                        as={feature.icon} 
                        boxSize={8} 
                        color={accentColor} 
                        className="feature-icon"
                      />
                      <Heading 
                        as="h3" 
                        fontSize="md" 
                        color={headingColor}
                        fontWeight="600"
                      >
                        {feature.title}
                      </Heading>
                      <Text 
                        color={textColor} 
                        fontSize="sm" 
                        lineHeight="short"
                      >
                        {feature.desc}
                      </Text>

                      {expanded === feature.title && (
                        <Box 
                          mt={2} 
                          p={3} 
                          bg={useColorModeValue('blue.50', 'blue.900')} 
                          borderRadius="md" 
                          borderLeftWidth="3px" 
                          borderLeftColor={accentColor}
                          w="full"
                        >
                          <Text fontSize="xs" color={textColor}>
                            Detailed dashboards with charts, filters, and export options.
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Collapsible.Content>
          </Collapsible.Root>


        {/* Contributors Section */}
        <Box mt={4} id="team">
          <ContributorsGrid />
        </Box>

        {/* Funding Section */}
        <Box mt={4} id="funding">
          <FundingDetails />
        </Box>

        {/* Grants Section */}
        <Box mt={4} id="grants">
          <GrantList />
        </Box>

        {/* Partners Section */}
        <Box mt={4}>
          <Partners />
        </Box>
      </VStack>
      </Box>
    </AllLayout>
  );
}
