"use client";
import { InputLeftElement } from "@/components/ui/compat";
;
import { useState, FormEvent, useEffect } from 'react';
import { useColorModeValue } from "../../../components/ui/color-mode";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AllLayout from '@/components/Layout';
import { Steps, Box, Button, Input, VStack, Heading, Text, Alert, Container, Icon, InputGroup, Field } from "@chakra-ui/react";
import { FaUser } from 'react-icons/fa';
import { LuArrowLeft, LuLock, LuMail } from 'react-icons/lu';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    fetch('/api/admin/auth/session')
      .then(res => {
        if (res.ok) {
          router.push('/admin/dashboard');
        }
      })
      .catch(() => {});
  }, [router]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AllLayout>
      <Container maxW="md" py={20}>
        <VStack gap={4}>
          {/* Back to Site Link */}
          <Link href="/" passHref>
            <Button as="a" variant="ghost" size="sm"><LuArrowLeft />Back to Site
                          </Button>
          </Link>

          <Box
            bg={bgColor}
            p={8}
            borderRadius="xl"
            boxShadow="2xl"
            border="1px"
            borderColor={borderColor}
            w="full"
          >
            <VStack gap={6} align="stretch">
              {/* Header */}
              <VStack gap={2}>
                <Box
                  bg="blue.500"
                  p={3}
                  borderRadius="full"
                  mb={2}
                >
                  <Icon as={LuLock} boxSize={6} color="white" />
                </Box>
                <Heading size="lg">Blog Admin</Heading>
                <Text color="gray.600" fontSize="sm">
                  Sign in to manage blog posts
                </Text>
              </VStack>

            {/* Error Alert */}
            {error && (
              <Alert.Root status="error" borderRadius="md">
                <Alert.Indicator />
                {error}
              </Alert.Root>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Field.Root required>
                  <Field.Label>Username</Field.Label>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUser} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </InputGroup>
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Password</Field.Label>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={LuLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </InputGroup>
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="blue"
                  width="full"
                  size="lg"
                  loading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
        </VStack>
      </Container>
    </AllLayout>
  );
}
