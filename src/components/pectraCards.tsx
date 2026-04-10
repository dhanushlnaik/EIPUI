import { Steps, Box, Text, Image, Link, Heading, Badge, AspectRatio, Center } from "@chakra-ui/react";

import { useColorModeValue } from "./ui/color-mode";

interface CardProps {
  image?: string;
  title: string;
  content: string;
  link: string;
  tag?: string;
}

export const Card = ({ image, title, content, link, tag }: CardProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  return (
    <Box
      bg={cardBg}
      p={5}
      borderRadius="xl"
      boxShadow="md"
      height="100%"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
    >
      {image && (
        <Center>
          <AspectRatio ratio={16 / 9} mb={4} borderRadius="lg" overflow="hidden" width="100%">
            <Image src={image} alt={title} objectFit="cover" />
          </AspectRatio>
        </Center>
      )}
      {tag && (
        <Badge colorPalette="blue" mb={2}>
          {tag}
        </Badge>
      )}
      <Heading fontSize={{ base: "lg", md: "xl" }} mb={2} lineClamp={2}>
        {title}
      </Heading>
      <Text fontSize="md" color={textColor} lineClamp={3} mb={4}>
        {content}
      </Text>
      <Link
        href={link}
        color={accentColor}
        fontWeight="semibold"
        display="inline-flex"
        alignItems="center"
        target='_blank'
        rel='noopener noreferrer'>
        Read more →
      </Link>
    </Box>
  );
};