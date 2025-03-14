import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiMapPin, FiUser, FiLogOut, FiBell } from "react-icons/fi";
import webLogo from "/web-logo-new.svg";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAuthRequired = () => {
    toast({
      title: "ต้องเข้าสู่ระบบก่อน",
      description: "กรุณาลงทะเบียนหรือเข้าสู่ระบบเพื่อแจ้งข้อมูลสุนัข",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
    navigate("/register");
  };

  return (
    <Box
      as="nav"
      h="80px"
      bg="white"
      borderBottom="1px"
      borderColor="neutral.200"
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex
        h="100%"
        px={4}
        align="center"
        justify="space-between"
        maxW="100%"
        mx="auto"
      >
        {/* Left side - Logo */}
        <RouterLink to="/">
          <Image h="60px" src={webLogo} alt="หาบ้าน.com" />
        </RouterLink>

        {/* Center - Main Actions */}
        <HStack spacing={4}>
          <Button
            as={RouterLink}
            to="/map"
            leftIcon={<FiMapPin />}
            variant="ghost"
            colorScheme="brand"
            size="lg"
          >
            ดูแผนที่
          </Button>
          {isAuthenticated ? (
            <>
              <Button
                as={RouterLink}
                to="/post-lost"
                variant="solid"
                colorScheme="orange"
                size="lg"
              >
                <HStack spacing={2}>
                  <Image
                    src="/marker-lost-custom.svg"
                    h="24px"
                    alt="Lost Dog"
                  />
                  <Text>แจ้งสุนัขหาย</Text>
                </HStack>
              </Button>
              <Button
                as={RouterLink}
                to="/post-found"
                variant="solid"
                colorScheme="brand"
                size="lg"
              >
                <HStack spacing={2}>
                  <Image
                    src="/marker-found-custom.svg"
                    h="24px"
                    alt="Found Dog"
                  />
                  <Text>แจ้งพบสุนัข</Text>
                </HStack>
              </Button>
            </>
          ) : (
            <>
              <Tooltip label="กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อน" hasArrow>
                <Button
                  variant="solid"
                  colorScheme="orange"
                  onClick={handleAuthRequired}
                  size="lg"
                >
                  <HStack spacing={2}>
                    <Image
                      src="/marker-lost-custom.svg"
                      h="24px"
                      alt="Lost Dog"
                    />
                    <Text>แจ้งสุนัขหาย</Text>
                  </HStack>
                </Button>
              </Tooltip>
              <Tooltip label="กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อน" hasArrow>
                <Button
                  variant="solid"
                  colorScheme="brand"
                  onClick={handleAuthRequired}
                  size="lg"
                >
                  <HStack spacing={2}>
                    <Image
                      src="/marker-found-custom.svg"
                      h="24px"
                      alt="Found Dog"
                    />
                    <Text>แจ้งพบสุนัข</Text>
                  </HStack>
                </Button>
              </Tooltip>
            </>
          )}
        </HStack>

        {/* Right side - Auth Buttons */}
        <HStack spacing={4}>
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <Menu>
                <MenuButton>
                  <HStack spacing={2}>
                    <Avatar
                      size="md"
                      name={user.name}
                      src={user.profileImage}
                      bg="brand.500"
                      color="white"
                      key={user.profileImage || "default-avatar"}
                    />
                    <Text display={{ base: "none", md: "block" }} fontSize="lg">
                      {user.name}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile" icon={<FiUser />}>
                    โปรไฟล์
                  </MenuItem>
                  <MenuItem
                    as={RouterLink}
                    to="/notifications"
                    icon={<FiBell />}
                  >
                    การแจ้งเตือน
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    icon={<FiLogOut />}
                    color="orange.500"
                  >
                    ออกจากระบบ
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/login"
                variant="outline"
                colorScheme="brand"
                size="lg"
              >
                เข้าสู่ระบบ
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="orange"
                size="lg"
                px={6}
              >
                ลงทะเบียนฟรี
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
