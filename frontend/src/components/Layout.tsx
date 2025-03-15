import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { usePageTracking } from "../hooks/usePageTracking";
import CookieConsent from "./CookieConsent";

const Layout = () => {
  // Initialize page tracking
  usePageTracking();

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={{ base: 2, md: 4 }} pb={{ base: "70px", md: 4 }}>
        <Outlet />
      </Box>
      <BottomNav />
      <CookieConsent />
    </Box>
  );
};

export default Layout;
