import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Link,
  CloseButton,
} from "@chakra-ui/react";

/**
 * Cookie consent banner for GDPR compliance
 */
export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setShowConsent(true);
    }
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
          <Text fontSize="sm" color={textColor}>
            เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณ
            ด้วยการใช้เว็บไซต์นี้ คุณยินยอมให้เราใช้คุกกี้ตาม{" "}
            <Link color="blue.500" href="/privacy-policy">
              นโยบายความเป็นส่วนตัว
            </Link>{" "}
            ของเรา
          </Text>
        </Box>
        <Flex>
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
