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
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiMapPin, FiUser, FiLogOut, FiBell, FiMenu } from "react-icons/fi";
import webLogo from "/web-logo-new.svg";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

        {/* Center - Main Actions - Hide on mobile */}
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Button
            as={RouterLink}
            to="/map"
            leftIcon={<FiMapPin />}
            variant="ghost"
            colorScheme="brand"
            size={{ base: "md", lg: "lg" }}
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
                size={{ base: "md", lg: "lg" }}
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
                colorScheme="teal"
                size={{ base: "md", lg: "lg" }}
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
              <Button
                onClick={handleAuthRequired}
                variant="solid"
                colorScheme="orange"
                size={{ base: "md", lg: "lg" }}
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
                onClick={handleAuthRequired}
                variant="solid"
                colorScheme="teal"
                size={{ base: "md", lg: "lg" }}
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
          )}
        </HStack>

        {/* Right side - User actions */}
        <HStack spacing={4}>
          {/* Mobile menu button - Only show on mobile */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Open menu"
            icon={<FiMenu />}
            onClick={onOpen}
            size="lg"
          />

          {/* User menu and notification bell - Hide notification bell on mobile */}
          <NotificationBell display={{ base: "none", md: "block" }} />

          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
              >
                <Avatar
                  size="sm"
                  name={user?.name || "User"}
                  src={user?.profileImage || undefined}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile" icon={<FiUser />}>
                  โปรไฟล์
                </MenuItem>
                <MenuItem onClick={handleLogout} icon={<FiLogOut />}>
                  ออกจากระบบ
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              colorScheme="brand"
              size={{ base: "sm", md: "md" }}
              display={{ base: "none", md: "inline-flex" }}
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody pt={10}>
            <VStack spacing={4} align="stretch">
              <Button
                as={RouterLink}
                to="/map"
                leftIcon={<FiMapPin />}
                variant="ghost"
                colorScheme="brand"
                size="lg"
                justifyContent="flex-start"
                onClick={onClose}
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
                    justifyContent="flex-start"
                    onClick={onClose}
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
                    colorScheme="teal"
                    size="lg"
                    justifyContent="flex-start"
                    onClick={onClose}
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

                  <Button
                    as={RouterLink}
                    to="/profile"
                    leftIcon={<FiUser />}
                    variant="ghost"
                    colorScheme="brand"
                    size="lg"
                    justifyContent="flex-start"
                    onClick={onClose}
                  >
                    โปรไฟล์
                  </Button>

                  <Button
                    as={RouterLink}
                    to="/notifications"
                    leftIcon={<FiBell />}
                    variant="ghost"
                    colorScheme="brand"
                    size="lg"
                    justifyContent="flex-start"
                    onClick={onClose}
                  >
                    การแจ้งเตือน
                  </Button>

                  <Button
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    colorScheme="red"
                    size="lg"
                    justifyContent="flex-start"
                  >
                    ออกจากระบบ
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      handleAuthRequired();
                      onClose();
                    }}
                    variant="solid"
                    colorScheme="orange"
                    size="lg"
                    justifyContent="flex-start"
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
                    onClick={() => {
                      handleAuthRequired();
                      onClose();
                    }}
                    variant="solid"
                    colorScheme="teal"
                    size="lg"
                    justifyContent="flex-start"
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

                  <Button
                    as={RouterLink}
                    to="/login"
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                    justifyContent="flex-start"
                    onClick={onClose}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
