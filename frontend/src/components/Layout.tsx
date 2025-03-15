import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

const Layout = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={{ base: 2, md: 4 }} pb={{ base: "70px", md: 4 }}>
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
};

export default Layout;
