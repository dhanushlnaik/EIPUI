import React, { useRef, useState, useEffect } from 'react';
import { useColorModeValue } from "./ui/color-mode";
import { Steps, Box, Text, Image, Link, Button, Icon, Flex } from "@chakra-ui/react";
import { FiHeart } from 'react-icons/fi';
import CopyLink from './CopyLink';

const supportersData = [
  {
    id: 'etherworld',
    name: 'EtherWorld',
    staticUrl: '/EtherWorld-gif.gif#static', // Suffix helps browser cache separately
    gifUrl: '/EtherWorld-gif.gif',
    url: 'https://etherworld.co/',
  },
  {
    id: 'esp',
    name: 'Ethereum Foundation ESP',
    staticUrl: '/ESP-gif.gif#static',
    gifUrl: '/ESP-gif.gif',
    url: 'https://esp.ethereum.foundation/',
  },
  {
    id: 'gitcoin',
    name: 'Gitcoin',
    staticUrl: '/Gitcoin-gif.gif#static',
    gifUrl: '/Gitcoin-gif.gif',
    url: 'https://gitcoin.co/',
  },
  {
    id: 'ech',
    name: 'Ethereum Cat Herders',
    staticUrl: '/ECH-gif.gif#static',
    gifUrl: '/ECH-gif.gif',
    url: 'https://www.ethereumcatherders.com/',
  },
];

// Individual supporter card component
const SupporterCard = ({ supporter }: { 
  supporter: typeof supportersData[0]; 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const staticImgRef = useRef<HTMLImageElement>(null);

  // Create static frame from GIF on mount
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = supporter.staticUrl.replace('#static', '');
    
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      }
    };
  }, [supporter.staticUrl]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowGif(true);
    // Removed: onHoverChange(true) - no longer pausing gallery
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowGif(false);
    // Removed: onHoverChange(false) - no longer pausing gallery
  };

  const borderColor = useColorModeValue('transparent', 'transparent');
  const bgColor = useColorModeValue('transparent', 'transparent');
  const tooltipBg = useColorModeValue('gray.800', 'gray.700');

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      cursor="pointer"
      position="relative"
      mx={6}
      flexShrink={0}
      transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'scale(1.08)',
      }}
    >
      <Link
        href={supporter.url}
        _hover={{ textDecoration: 'none' }}
        onClick={(e) => e.stopPropagation()}
        target='_blank'
        rel='noopener noreferrer'>
        <Box
          bg={bgColor}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          boxShadow={isHovered ? '0 8px 30px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)'}
          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          position="relative"
          width={{ base: "180px", md: "220px", lg: "260px" }}
          height="auto"
          _hover={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Canvas for static frame - shown when not hovering */}
          <canvas
            ref={canvasRef}
            style={{
              display: showGif ? 'none' : 'block',
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              opacity: isHovered ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
          
          {/* GIF image - shown when hovering */}
          {showGif && (
            <Image
              ref={imgRef}
              src={supporter.gifUrl} // Removed cache busting to prevent reload glitch
              alt={supporter.name}
              width="100%"
              height="auto"
              objectFit="contain"
              draggable={false}
              loading="eager"
              style={{
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
          )}
          
          {/* Smooth tooltip overlay */}
          <Box
            position="absolute"
            bottom="0"
            left="50%"
            transform={isHovered ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)'}
            bg={tooltipBg}
            color="white"
            py={2}
            px={4}
            borderRadius="md"
            opacity={isHovered ? 1 : 0}
            pointerEvents="none"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            whiteSpace="nowrap"
            fontSize="sm"
            fontWeight="600"
            boxShadow="lg"
            zIndex={2}
            mb={-10}
          >
            <Text textAlign="center">{supporter.name}</Text>
            {/* Tooltip arrow */}
            <Box
              position="absolute"
              top="-4px"
              left="50%"
              transform="translateX(-50%)"
              width="0"
              height="0"
              borderLeft="6px solid transparent"
              borderRight="6px solid transparent"
              borderBottom={`6px solid ${tooltipBg}`}
            />
          </Box>
        </Box>
      </Link>
    </Box>
  );
};

export default function SupportedBy() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  
  // Duplicate the array to create seamless infinite scroll
  const duplicatedSupporters = [...supportersData, ...supportersData, ...supportersData];

  return (
    <Box
      as="section"
      id="supported-by"
      bg={cardBg}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderCol}
      p={{ base: 4, md: 6 }}
      mb={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background Gradient Accent */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="3px"
        bgGradient="linear(90deg, #667eea 0%, #764ba2 50%, #0fdb8b 100%)"
        opacity={0.6}
      />
      {/* Improved Header with Subtitle */}
      <Box mb={4}>
        <Flex alignItems="center" mb={3} gap={3} direction="row" textAlign="left" justifyContent="center">
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="700"
            color={headingColor}
            letterSpacing="-0.02em"
          >
            Supported by
          </Text>
          <Box alignSelf="center">
            <CopyLink link="https://eipsinsight.com/#supported-by" />
          </Box>
        </Flex>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={subtitleColor}
          fontWeight="500"
          textAlign="center"
        >
          Proudly backed by leading organizations in the Ethereum ecosystem
        </Text>
      </Box>
      {/* Continuous Scrolling Gallery Container */}
      <Box
        position="relative"
        overflow="hidden"
        width="100%"
        py={3}
      >
        {/* Scrolling Track - Always Running */}
        <Box
          display="flex"
          alignItems="center"
          width="max-content"
          css={{
            animation: 'scroll 50s linear infinite',
            willChange: 'transform',

            '& @keyframes scroll': {
              '0%': {
                transform: 'translateX(0)',
              },
              '100%': {
                transform: 'translateX(-33.333%)', // Move by one set of 4 items
              },
            }
          }}
        >
          {duplicatedSupporters.map((supporter, index) => (
            <SupporterCard
              key={`${supporter.id}-${index}`}
              supporter={supporter}
            />
          ))}
        </Box>

        {/* Softer Gradient Overlays for Fade Effect */}
        <Box
          position="absolute"
          top="0"
          left="0"
          bottom="0"
          width="120px"
          bgGradient={`linear(to-r, ${cardBg}, transparent)`}
          pointerEvents="none"
          zIndex={1}
        />
        <Box
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          width="120px"
          bgGradient={`linear(to-l, ${cardBg}, transparent)`}
          pointerEvents="none"
          zIndex={1}
        />
      </Box>
      {/* Support CTA */}
      <Box mt={6} textAlign="center">
        <Link href="/donate" _hover={{ textDecoration: 'none' }}>
          <Button
            size="lg"
            colorPalette="blue"
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            _hover={{
              bgGradient: 'linear(135deg, #5568d3 0%, #6a3f92 100%)',
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s"
            borderRadius="xl"
            px={8}
            py={6}
            fontWeight="700"
            fontSize="md"><Icon as={FiHeart} />Support Our Mission
                      </Button>
        </Link>
        <Text
          mt={3}
          fontSize="sm"
          color={useColorModeValue('gray.600', 'gray.400')}
        >
          Help us maintain this free and open-source platform
        </Text>
      </Box>
    </Box>
  );
}