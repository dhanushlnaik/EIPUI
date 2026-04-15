"use client";
import { InputLeftElement, InputRightElement } from "@/components/ui/compat";
import { useToast } from "@/components/ui/use-toast";
// update the frontend implementation in this and provide full code:
;
import { Steps, Flex, Heading, Input, Button, InputGroup, Stack, Box, Link, Avatar, Text, Alert, Icon, IconButton, AbsoluteCenter, Separator, Field } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { FaGithub, FaGoogle, FaUserAlt, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import AllLayout from "@/components/LoginLayout";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        router.push("/");
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      } else if (res?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setPending(false);
    }
  };

  const handleProvider = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: "/" });
  };

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const inputBg = useColorModeValue("white", "gray.600");
  const iconColor = useColorModeValue("gray.400", "gray.300");

  return (
    <AllLayout>
      <Box position="relative" w="full" minH="100vh">
        {/* Back Arrow Button */}
        <IconButton
          aria-label="Go back"
          size="lg"
          position="absolute"
          top={4}
          left={4}
          zIndex={10}
          variant="ghost"
          colorPalette="teal"
          onClick={() => router.push("/")}
          fontSize="24px"
          _hover={{
            transform: "scale(1.1)",
            bg: "transparent"
          }}><FaArrowLeft /></IconButton>

        <Flex
          minH="100vh"
          align="center"
          justify="center"
          bg={bgColor}
          px={4}
        >
          <Stack
            gap={8}
            mx="auto"
            maxW="md"
            w="full"
            py={12}
            px={6}
          >
            <Stack align="center">
              <Avatar.Root size="xl" bg="teal.500" color="white" mb={2}><Avatar.Fallback>{<FaUserAlt fontSize="1.5rem" />}</Avatar.Fallback></Avatar.Root>
              <Heading fontSize="3xl" textAlign="center" color="teal.500">
                Welcome back
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Sign in to your account
              </Text>
            </Stack>

            {error && (
              <Alert.Root status="error" borderRadius="md">
                <Alert.Indicator />
                {error}
              </Alert.Root>
            )}

            <Box
              rounded="lg"
              bg={cardBg}
              boxShadow="lg"
              p={8}
            >
              <form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  <Field.Root id="email">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaUserAlt} color={iconColor} />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg={inputBg}
                        color="black"
                        borderColor="gray.300"
                        _hover={{
                          borderColor: "teal.400"
                        }}
                        _focus={{
                          borderColor: "teal.500",
                          boxShadow: "0 0 0 1px teal.500"
                        }}
                        disabled={pending}
                        required
                      />
                    </InputGroup>
                  </Field.Root>

                  <Field.Root id="password">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaLock} color={iconColor} />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg={inputBg}
                        color="black"
                        borderColor="gray.300"
                        _hover={{
                          borderColor: "teal.400"
                        }}
                        _focus={{
                          borderColor: "teal.500",
                          boxShadow: "0 0 0 1px teal.500"
                        }}
                        disabled={pending}
                        required
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          _hover={{ bg: "transparent" }}
                          _active={{ bg: "transparent" }}
                        >
                          <Icon 
                            as={showPassword ? FaEyeSlash : FaEye} 
                            color="gray.500" 
                          />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <Flex justify="flex-end">
                      <Link
                        as={NextLink}
                        href="#"
                        color="teal.500"
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                      >
                        Forgot password?
                      </Link>
                    </Flex>
                  </Field.Root>

                  <Button
                    type="submit"
                    colorPalette="teal"
                    size="lg"
                    fontSize="md"
                    loading={pending}
                    loadingText="Signing in..."
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    _active={{
                      transform: "none"
                    }}
                  >
                    Sign in
                  </Button>
                </Stack>
              </form>

              <Separator my={6} borderColor="gray.300" />

              <Text textAlign="center" color="gray.600">
              Don't have an account?{" "}
              {/* <Link 
                as={NextLink} 
                href="/signup" 
                color="teal.500"
                fontWeight="semibold"
                _hover={{ textDecoration: "underline" }}
              >
                Sign up
              </Link> */}
            </Text>
            <br/>

              <Stack gap={4}>
                <Button
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => handleProvider("google")}
                  disabled={pending}
                  _hover={{
                    bg: "gray.500",
                    transform: "translateY(-1px)"
                  }}><FaGoogle />Continue with Google
                                  </Button>
                <Button
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => handleProvider("github")}
                  disabled={pending}
                  _hover={{
                    bg: "gray.500",
                    transform: "translateY(-1px)"
                  }}><FaGithub />Continue with GitHub
                                  </Button>
              </Stack>
            </Box>

          </Stack>
        </Flex>
      </Box>
    </AllLayout>
  );
};

export default SignIn;