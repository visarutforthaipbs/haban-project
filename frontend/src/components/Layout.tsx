import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
