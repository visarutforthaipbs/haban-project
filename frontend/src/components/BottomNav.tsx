import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FiHome, FiMap, FiPlusCircle, FiUser, FiBell } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Define navigation items
  const navItems = [
    { icon: FiHome, label: "หน้าแรก", path: "/" },
    { icon: FiMap, label: "แผนที่", path: "/map" },
    { icon: FiPlusCircle, label: "แจ้งสุนัข", path: "/post-lost" },
    {
      icon: FiBell,
      label: "แจ้งเตือน",
      path: "/notifications",
      requiresAuth: true,
    },
    {
      icon: FiUser,
      label: isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ",
      path: isAuthenticated ? "/profile" : "/login",
    },
  ];

  // Filter out items that require authentication if user is not authenticated
  const filteredItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      display={{ base: "block", md: "none" }}
      zIndex={10}
      borderTopWidth="1px"
      borderColor="gray.200"
    >
      <Flex justify="space-around" py={2}>
        {filteredItems.map(({ icon: Icon, label, path }) => (
          <RouterLink key={path} to={path} style={{ flex: 1 }}>
            <Flex
              direction="column"
              align="center"
              justify="center"
              color={location.pathname === path ? "brand.500" : "gray.500"}
              _hover={{ color: "brand.500" }}
              h="100%"
              px={1}
            >
              <IconButton
                aria-label={label}
                icon={<Icon />}
                variant="ghost"
                size="sm"
                fontSize="1.2rem"
              />
              <Text fontSize="xs" mt={1} textAlign="center" noOfLines={1}>
                {label}
              </Text>
            </Flex>
          </RouterLink>
        ))}
      </Flex>
    </Box>
  );
};

export default BottomNav;
