"use client";
import { useDisclosure } from "@/components/ui/compat";

;
import { Steps, Box, Button, Text, HStack, VStack, Link, Switch, Field, Dialog, Portal } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    functional: false,
  });
  
  const { open, onOpen, onClose } = useDisclosure();

  // Theme colors matching EIPs Insight
  const bannerBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const bannerBorder = useColorModeValue('gray.200', 'gray.600');
  const bannerShadow = useColorModeValue('0 2px 20px rgba(0,0,0,0.15)', '0 2px 20px rgba(0,0,0,0.5)');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const buttonBg = useColorModeValue('blue.500', 'blue.400');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('eips-insight-cookie-consent');
    
    if (!consent) {
      // Show banner after 1 second delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const fullConsent = { necessary: true, analytics: true, functional: true };
    setPreferences(fullConsent);
    saveCookiePreferences(fullConsent);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = { necessary: true, analytics: false, functional: false };
    setPreferences(necessaryOnly);
    saveCookiePreferences(necessaryOnly);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    onClose();
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('eips-insight-cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('eips-insight-consent-date', new Date().toISOString());
    
    // Initialize/disable Google Analytics based on consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      if (prefs.analytics) {
        // Enable Google Analytics
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      } else {
        // Disable Google Analytics
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 99999, // Increased z-index
            }}
          >
            <Box
              bg={bannerBg}
              borderTop="1px"
              borderColor={bannerBorder}
              boxShadow={bannerShadow}
              p={4}
              backdropFilter="blur(10px)"
            >
              <VStack gap={3} maxW="6xl" mx="auto">
                <Text color={textColor} fontSize="sm" textAlign="center">
                  🍪 We use cookies to enhance your experience. Our site uses necessary cookies for basic functionality and optional analytics cookies to understand how you use EIPs Insight.{' '}
                  <Link
                    color="blue.500"
                    href="/privacy"
                    target='_blank'
                    rel='noopener noreferrer'>
                    Learn more in our Privacy Policy
                  </Link>
                </Text>
                
                <HStack gap={3} flexWrap="wrap" justify="center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={acceptNecessary}
                    colorPalette="gray"
                  >
                    Necessary Only
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpen}
                    colorPalette="blue"
                  >
                    Customize
                  </Button>
                  
                  <Button
                    size="sm"
                    bg={buttonBg}
                    color="white"
                    onClick={acceptAll}
                    _hover={{ opacity: 0.9 }}
                  >
                    Accept All
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Preferences Modal */}
      <Dialog.Root open={open} size='lg' onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <Dialog.Backdrop backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Cookie Preferences</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body pb={6}>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" color={textColor}>
                    Manage your cookie preferences for EIPs Insight. You can change these settings at any time.
                  </Text>

                  <Field.Root display="flex" alignItems="center" justifyContent="space-between">
                    <Box flex="1">
                      <Field.Label mb="0" fontWeight="semibold">
                        Necessary Cookies
                      </Field.Label>
                      <Text fontSize="xs" color={textColor}>
                        Required for basic site functionality, authentication, and security.
                      </Text>
                    </Box>
                    <Switch
                      checked={preferences.necessary}
                      disabled={true}
                      colorPalette="blue"
                    />
                  </Field.Root>

                  <Field.Root display="flex" alignItems="center" justifyContent="space-between">
                    <Box flex="1">
                      <Field.Label mb="0" fontWeight="semibold">
                        Analytics Cookies
                      </Field.Label>
                      <Text fontSize="xs" color={textColor}>
                        Help us understand how you use EIPs Insight to improve the platform.
                      </Text>
                    </Box>
                    <Switch
                      checked={preferences.analytics}
                      onValueChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      colorPalette="blue"
                    />
                  </Field.Root>

                  <Field.Root display="flex" alignItems="center" justifyContent="space-between">
                    <Box flex="1">
                      <Field.Label mb="0" fontWeight="semibold">
                        Functional Cookies
                      </Field.Label>
                      <Text fontSize="xs" color={textColor}>
                        Remember your preferences and enhance your experience.
                      </Text>
                    </Box>
                    <Switch
                      checked={preferences.functional}
                      onValueChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                      colorPalette="blue"
                    />
                  </Field.Root>

                  <HStack gap={3} justify="flex-end" mt={6}>
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorPalette="blue" onClick={saveCustomPreferences}>
                      Save Preferences
                    </Button>
                  </HStack>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </>
  );
};

export default CookieConsent;
