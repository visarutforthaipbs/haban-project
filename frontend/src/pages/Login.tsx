import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  useColorModeValue,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaFacebook, FaGoogle } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithFacebook, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      // Error is handled in AuthContext
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      navigate("/");
    } catch {
      // Error is handled in AuthContext
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch {
      // Error is handled in AuthContext
    }
  };

  return (
    <Container
      maxW="lg"
      py={{ base: "12", md: "24" }}
      px={{ base: "0", sm: "8" }}
    >
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
            <Heading size={{ base: "xs", md: "sm" }}>เข้าสู่ระบบ</Heading>
            <Text color="fg.muted">
              ยังไม่มีบัญชี?{" "}
              <Link as={RouterLink} to="/register" color="brand.500">
                ลงทะเบียน
              </Link>
            </Text>
          </Stack>
        </Stack>
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={{ base: "none", sm: "md" }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <Stack spacing="6">
            <Text fontSize="sm" textAlign="center" color="gray.600">
              คุณสามารถเข้าสู่ระบบหรือลงทะเบียนใหม่ด้วยบัญชีโซเชียลได้ง่ายๆ
            </Text>
            <Button
              colorScheme="facebook"
              leftIcon={<FaFacebook />}
              onClick={handleFacebookLogin}
              isLoading={isLoading}
              size="lg"
              fontSize="md"
            >
              เข้าสู่ระบบ/ลงทะเบียนด้วย Facebook
            </Button>

            <Button
              bg="#DB4437"
              color="white"
              _hover={{ bg: "#C53929" }}
              leftIcon={<FaGoogle />}
              onClick={handleGoogleLogin}
              isLoading={isLoading}
              size="lg"
              fontSize="md"
            >
              เข้าสู่ระบบ/ลงทะเบียนด้วย Google
            </Button>

            <HStack>
              <Divider />
              <Text fontSize="sm" whiteSpace="nowrap" color="fg.muted">
                หรือ
              </Text>
              <Divider />
            </HStack>

            <form onSubmit={handleSubmit}>
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="email">อีเมล</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">รหัสผ่าน</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormControl>
              </Stack>
              <Stack spacing="6" mt={6}>
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                >
                  เข้าสู่ระบบ
                </Button>
                <Text textAlign="center">
                  <Link as={RouterLink} to="/forgot-password" color="brand.500">
                    ลืมรหัสผ่าน?
                  </Link>
                </Text>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
