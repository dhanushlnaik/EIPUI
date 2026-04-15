import { useDisclosure } from "@/components/ui/compat";
import React, { useState, useEffect } from 'react';
import { useColorModeValue } from "./ui/color-mode";
import { Steps, Box, Heading, SimpleGrid, Avatar, Text, VStack, Link, Button, HStack, Image, Flex, Stack, IconButton, Badge, Icon, Dialog, Portal } from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaUsers } from 'react-icons/fa';

const MotionBox = motion(Box);

// Core contributors provided by the project maintainers (shown first)
const coreContributors = [
  {
    name: 'Pooja Ranjan',
    handle: 'poojaranjan',
    role: 'Founder',
    avatar: '/avatars/Pooja.jpg',
    github: 'https://github.com/poojaranjan',
    twitter: 'https://x.com/poojaranjan19',
    linkedin: 'https://www.linkedin.com/in/pooja-r-072899114/',
    farcaster: 'https://farcaster.xyz/poojaranjan19',
    bio: 'Building Ethereum community | ECH Institute | EtherWorld | EIPsInsight | Herder-in-Chief',
    duration: 'Jun 2022 - Present · 3+ yrs',
    expertise: ['Data Analytics', 'Governance', 'Community'],
    highlights: [
      'Built the first comprehensive EIP tracking platform',
      'Provides insights on proposal statuses & governance trends',
      'Serves developers, researchers & Ethereum community'
    ]
  },
    {
    name: 'Yash Kamal Chaturvedi',
    handle: 'yashkamalchaturvedi',
    role: 'Operations Lead',
    avatar: '/avatars/yash.jpg',
    github: 'https://github.com/yashkamalchaturvedi',
    twitter: 'https://x.com/YashKamalChatu1',
    linkedin: 'https://www.linkedin.com/in/yash-kamal-chaturvedi',
    bio: 'Making things work when they shouldn\'t — Operations at Avarch | Growth & DevOps | Coffee enthusiast',
    duration: 'Dec 2024 - Present · 1+ yr',
    expertise: ['Operations', 'Growth', 'B2B Lead Gen'],
    highlights: [
      'Manages operational workflows and team coordination',
      'Drives growth through strategic outreach initiatives',
      'Handles technical content and social media presence'
    ]
  },
  {
    name: 'Dhanush Naik',
    handle: 'dhanushlnaik',
    role: 'Full Stack Engineer',
    avatar: '/avatars/Dhanush.jpg',
    github: 'https://github.com/dhanushlnaik',
    twitter: 'https://x.com/iamdhanushlnaik',
    linkedin: 'https://www.linkedin.com/in/dhanushlnaik/',
    farcaster: 'https://farcaster.xyz/dhanushlnaik',
    bio: 'Breaking things (and actually fixing them) — Full-stack wizard behind EIPsInsight | Hackathon addict',
    duration: 'Nov 2023 - Present · 2+ yrs',
    expertise: ['Next.js', 'MongoDB', 'Full-Stack'],
    highlights: [
      'Developed frontend & backend with Next.js, Node.js, MongoDB',
      'Implemented custom scheduler for GitHub EIP data extraction',
      'Rebuilt platform with modern glassmorphism UI design'
    ]
  },
  {
    name: 'Ayush Shetty',
    handle: 'AyuShetty',
    role: 'Product Engineer',
    avatar: '/avatars/Ayush.jpg',
    github: 'https://github.com/AyuShetty',
    twitter: 'https://x.com/ayushettyeth',
    linkedin: 'https://www.linkedin.com/in/ayushetty',
    farcaster: 'https://farcaster.xyz/ayushshetty',
    bio: 'Product engineer — building eth.ed | TeamAvarch | EtherWorld | EIPsInsight',
    duration: 'Mar 2023 - Present · 2+ yrs',
    expertise: ['Product Design', 'Marketing', 'Web3'],
    highlights: [
      'Manages product engineering and development workflow',
      'Drives community engagement and outreach initiatives',
      'Collaborates on UX improvements and feature planning'
    ]
  }
];

export default function ContributorsGrid() {
  const { open, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<any | null>(null);
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const headingColor = useColorModeValue("gray.900", "white");
  const linkColor = useColorModeValue("blue.500", "blue.300");
  const socialBg = useColorModeValue('purple.50', 'purple.700');
  const socialColor = useColorModeValue('purple.700', 'white');
  const socialBorder = useColorModeValue('purple.400', 'purple.300');
  const accent = useColorModeValue('#6B46C1', '#9F7AEA');
  const glassBorder = useColorModeValue('rgba(16,24,40,0.06)', 'rgba(255,255,255,0.04)');

  const [contributorsList, setContributorsList] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/allcontributors')
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        if (!mounted) return;
        // support different response shapes
        const list = Array.isArray(data) ? data : (data?.contributors || []);
        setContributorsList(list);
      })
      .catch((err) => {
        console.error('Failed to fetch contributors', err);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  // prepare items to render and total count (filter out empty records)
  const computeItems = () => {
    // Merge core contributors first, then the fetched list, dedupe by name/twitter/github
    const merged = [...coreContributors, ...(contributorsList || [])];
    const deduped = merged.filter((v, i, arr) => {
      const key = ((v.github || v.twitter || v.name) || '').toString().toLowerCase();
      return arr.findIndex(x => (((x.github || x.twitter || x.name) || '').toString().toLowerCase()) === key) === i;
    });

    const filtered = deduped.filter((c: any) => {
      const q = query.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || ((c.github || c.twitter || '') + '').toLowerCase().includes(q);
    })
    // drop truly empty records (no name and no socials and no avatar and no bio)
    .filter((c: any) => {
      if (!c) return false;
      return !!(c.name || c.github || c.twitter || c.linkedin || c.farcaster || c.avatar || c.bio);
    });

    const total = filtered.length;
    const items = filtered.slice(0, visible);
    return { items, total };
  };

  const { items: itemsToRender, total: totalCount } = loading
    ? { items: Array.from({ length: 6 }, (_, i) => ({ placeholder: true, id: i })), total: 0 }
    : computeItems();

  return (
    <Box
      bg={cardBg}
      p={{ base: 6, md: 8 }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow={useColorModeValue('md', 'lg')}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        opacity={0.05}
        transform="rotate(-15deg)"
      >
        <Icon as={FaUsers} boxSize="200px" />
      </Box>
      <HStack gap={3} mb={6} position="relative">
        <Icon as={FaUsers} boxSize={8} color={accent} />
        <Heading 
          as="h2" 
          fontSize={{ base: "2xl", md: "3xl" }} 
          textAlign="left" 
          fontWeight="700" 
          color={headingColor}
        >
          Our Team
        </Heading>
      </HStack>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
        {itemsToRender.map((contrib: any, idx: number) => (
          <MotionBox
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            bg={useColorModeValue('white', 'gray.700')}
            borderRadius="xl"
            boxShadow={useColorModeValue('md', 'lg')}
            p={6}
            role="group"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
            position="relative"
            overflow="hidden"
            cursor="pointer"
            _hover={{ 
              boxShadow: useColorModeValue('xl', '2xl'), 
              borderColor: accent,
            }}
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              w="full"
              h="2px"
              bg={accent}
              transform="scaleX(0)"
              transformOrigin="left"
              transition="transform 0.3s ease"
              _groupHover={{ transform: 'scaleX(1)' }}
            />
            <VStack gap={3} align="stretch" w="full">
              <VStack gap={3}>
                <Box position="relative">
                  <Avatar.Root
                    size="2xl"
                    cursor="pointer"
                    onClick={() => { setSelected(contrib); onOpen(); }}
                    borderWidth="3px"
                    borderColor={accent}
                    transition="all 0.3s ease"
                    _groupHover={{ 
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: `0 10px 30px ${accent}40`
                    }}><Avatar.Fallback name={contrib.name} /><Avatar.Image src={contrib.avatar} /></Avatar.Root>
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    bg={accent}
                    borderRadius="full"
                    p={1}
                  >
                    <Badge 
                      colorPalette="green" 
                      variant="solid" 
                      fontSize="0.6em"
                      borderRadius="full"
                    >
                      Active
                    </Badge>
                  </Box>
                </Box>
                
                <VStack gap={1}>
                  <Text 
                    fontWeight="800" 
                    color={textColor} 
                    fontSize="lg" 
                    textAlign="center"
                    letterSpacing="tight"
                  >
                    {contrib.name || '—'}
                  </Text>
                  {contrib.role && (
                    <Badge 
                      colorPalette="purple" 
                      variant="subtle"
                      fontSize="xs"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {contrib.role}
                    </Badge>
                  )}
                </VStack>
              </VStack>



              <HStack gap={3} pt={2} justify="center">
                {contrib.github && (
                  <IconButton
                    as="a"
                    href={contrib.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Github"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={(e) => e.stopPropagation()}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}><FaGithub /></IconButton>
                )}
                {contrib.twitter && (
                  <IconButton
                    as="a"
                    href={contrib.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={(e) => e.stopPropagation()}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}><FaTwitter /></IconButton>
                )}
                {contrib.linkedin && (
                  <IconButton
                    as="a"
                    href={contrib.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={(e) => e.stopPropagation()}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}><FaLinkedin /></IconButton>
                )}
                {contrib.farcaster && (
                  <IconButton
                    as="a"
                    href={contrib.farcaster}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Farcaster"
                    size="sm"
                    variant="ghost"
                    colorPalette="purple"
                    onClick={(e) => e.stopPropagation()}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}><Image src="/farcaster-logo.png" alt="Farcaster" boxSize="16px" /></IconButton>
                )}
              </HStack>
            </VStack>
          </MotionBox>
        ))}
      </SimpleGrid>
      {!loading && totalCount > visible && (
        <Box textAlign="center" mt={8}>
          <Button 
            onClick={() => setVisible(v => v + 6)} 
            size="md" 
            colorPalette="purple"
            variant="outline"
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            Load More Team Members
          </Button>
        </Box>
      )}
      {/* Contributor detail modal */}
      <Dialog.Root open={open} placement='center' size='xl' onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <Dialog.Backdrop backdropFilter="blur(10px)" />
          <Dialog.Positioner>
            <Dialog.Content bg={cardBg} borderRadius="2xl">
              <Dialog.Header>
                <VStack gap={2} align="start">
                  <Text fontSize="2xl" fontWeight="800" color={headingColor}>
                    {selected?.name}
                  </Text>
                  {selected?.role && (
                    <Badge colorPalette="purple" fontSize="sm" px={3} py={1}>
                      {selected?.role}
                    </Badge>
                  )}
                </VStack>
              </Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body pb={6}>
                <VStack gap={6} align="center">
                  <Avatar.Root size="2xl" borderWidth="3px" borderColor={accent}><Avatar.Fallback name={selected?.name} /><Avatar.Image src={selected?.avatar} /></Avatar.Root>

                  <HStack gap={4} justify="center">
                    {selected?.github && (
                      <IconButton
                        as="a"
                        href={selected?.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        colorPalette="purple"
                        variant="ghost"
                        size="lg"><FaGithub /></IconButton>
                    )}
                    {selected?.twitter && (
                      <IconButton
                        as="a"
                        href={selected?.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        colorPalette="purple"
                        variant="ghost"
                        size="lg"><FaTwitter /></IconButton>
                    )}
                    {selected?.linkedin && (
                      <IconButton
                        as="a"
                        href={selected?.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        colorPalette="purple"
                        variant="ghost"
                        size="lg"><FaLinkedin /></IconButton>
                    )}
                    {selected?.farcaster && (
                      <IconButton
                        as="a"
                        href={selected?.farcaster}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Farcaster"
                        colorPalette="purple"
                        variant="ghost"
                        size="lg"><Image src="/farcaster-logo.png" alt="Farcaster" boxSize="20px" /></IconButton>
                    )}
                  </HStack>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </Box>
  );
}
