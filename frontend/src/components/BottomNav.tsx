import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { FiHome, FiMap, FiPlusCircle } from "react-icons/fi";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: FiHome, label: "Home", path: "/" },
    { icon: FiMap, label: "Map", path: "/map" },
    { icon: FiPlusCircle, label: "Report", path: "/post-lost" },
  ];

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
    >
      <Flex justify="space-around" py={2}>
        {navItems.map(({ icon: Icon, label, path }) => (
          <RouterLink key={path} to={path}>
            <Flex
              direction="column"
              align="center"
              color={location.pathname === path ? "brand.500" : "gray.500"}
              _hover={{ color: "brand.500" }}
            >
              <IconButton
                aria-label={label}
                icon={<Icon />}
                variant="ghost"
                size="lg"
              />
              <Text fontSize="xs" mt={1}>
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
