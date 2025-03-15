import { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Link,
  CloseButton,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

/**
 * Cookie consent banner for GDPR compliance
 */
export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setShowConsent(true);
    }

    // Check if user is admin (basic check - enhance with actual auth later)
    const checkIfAdmin = () => {
      // This is a placeholder - implement proper admin check
      const isAdminUser = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(isAdminUser);
    };

    checkIfAdmin();
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowConsent(false);
    // Reload the page to initialize analytics after consent
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShowConsent(false);
  };

  // For admin use only - triple-click to set admin mode (for testing)
  const handleTextClick = () => {
    clickCount.current += 1;

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
    }

    clickTimer.current = window.setTimeout(() => {
      if (clickCount.current >= 3) {
        localStorage.setItem("isAdmin", "true");
        setIsAdmin(true);
      }
      clickCount.current = 0;
    }, 500);
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  if (!showConsent) return null;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      p={4}
      bg={bgColor}
      boxShadow="md"
      zIndex="banner"
      borderTopWidth="1px"
      borderTopColor="gray.200"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
      >
        <Box mr={4} mb={{ base: 4, md: 0 }}>
          <Text fontSize="sm" color={textColor} onClick={handleTextClick}>
            เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณ
            ด้วยการใช้เว็บไซต์นี้ คุณยินยอมให้เราใช้คุกกี้ตาม{" "}
            <Link color="blue.500" href="/privacy-policy">
              นโยบายความเป็นส่วนตัว
            </Link>{" "}
            ของเรา
          </Text>
        </Box>
        <Flex>
          {isAdmin && (
            <Tooltip label="View Firebase Analytics Dashboard">
              <IconButton
                aria-label="View Analytics"
                icon={<InfoIcon />}
                size="sm"
                variant="ghost"
                mr={2}
                onClick={() =>
                  window.open(
                    "https://console.firebase.google.com/project/haban-pics/analytics/app/web:G-9ZJZPWPNX6/overview",
                    "_blank"
                  )
                }
              />
            </Tooltip>
          )}
          <Button size="sm" colorScheme="blue" onClick={handleAccept} mr={2}>
            ยอมรับ
          </Button>
          <Button size="sm" variant="outline" onClick={handleDecline}>
            ปฏิเสธ
          </Button>
        </Flex>
      </Flex>
      <CloseButton
        position="absolute"
        right={3}
        top={3}
        onClick={handleDecline}
        size="sm"
      />
    </Box>
  );
}
