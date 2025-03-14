import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  Text,
  Input,
  Button,
  useToast,
  Divider,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";

const NotificationSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    notificationSettings,
    updateNotificationSettings,
    fetchNotificationSettings,
  } = useNotifications();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [enableEmailNotifications, setEnableEmailNotifications] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      // Don't attempt to load if not authenticated
      if (!isAuthenticated || !user) {
        setIsInitialLoading(false);
        setError(
          "คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบเพื่อเข้าถึงการตั้งค่า"
        );
        return;
      }

      setIsInitialLoading(true);
      try {
        await fetchNotificationSettings();
        setError(null);
      } catch (error) {
        console.error("Error loading notification settings:", error);
        setError("ไม่สามารถโหลดการตั้งค่าการแจ้งเตือนได้");

        // Only show toast if it's not our first attempt
        if (retryCount > 0) {
          toast({
            title: "ไม่สามารถโหลดการตั้งค่าการแจ้งเตือนได้",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setIsInitialLoading(false);
        setRetryCount((prev) => prev + 1);
      }
    };

    loadSettings();
  }, [fetchNotificationSettings, toast, isAuthenticated, user, retryCount]);

  useEffect(() => {
    if (notificationSettings) {
      setEnableEmailNotifications(
        notificationSettings.enableEmailNotifications
      );
      setEmail(notificationSettings.email || user?.email || "");
    } else if (user) {
      // Default settings if none exist
      setEmail(user.email || "");
    }
  }, [notificationSettings, user]);

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") {
      return "กรุณาระบุอีเมล";
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "รูปแบบอีเมลไม่ถูกต้อง";
    }

    return "";
  };

  const handleSave = async () => {
    // Clear previous errors
    setEmailError("");

    // Validate email if email notifications are enabled
    if (enableEmailNotifications) {
      const error = validateEmail(email);
      if (error) {
        setEmailError(error);
        return;
      }
    }

    setIsLoading(true);

    try {
      await updateNotificationSettings({
        enableEmailNotifications,
        email: enableEmailNotifications ? email.trim() : undefined,
      });

      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "ไม่สามารถบันทึกการตั้งค่าได้",
        description: "โปรดลองอีกครั้งในภายหลัง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleToggleEmailNotifications = () => {
    const newValue = !enableEmailNotifications;
    setEnableEmailNotifications(newValue);

    // Clear email error when disabling email notifications
    if (!newValue && emailError) {
      setEmailError("");
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0); // Reset retry count to trigger a new load
  };

  if (isInitialLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          เกิดข้อผิดพลาด
        </AlertTitle>
        <AlertDescription maxWidth="sm">{error}</AlertDescription>
        <Button mt={4} colorScheme="red" onClick={handleRetry}>
          ลองใหม่อีกครั้ง
        </Button>
      </Alert>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      shadow="md"
      bg="white"
      maxW="600px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">ตั้งค่าการแจ้งเตือน</Heading>

        <Box>
          <Heading size="sm" mb={4}>
            ช่องทางการแจ้งเตือน
          </Heading>

          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center">
              <Switch
                id="in-app-notifications"
                isChecked={true}
                isDisabled={true}
                mr={3}
              />
              <Box>
                <FormLabel htmlFor="in-app-notifications" mb={0}>
                  แจ้งเตือนในแอปพลิเคชัน
                </FormLabel>
                <Text fontSize="xs" color="gray.500">
                  การแจ้งเตือนในแอปพลิเคชันเปิดใช้งานเสมอสำหรับทุกบัญชี
                </Text>
              </Box>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <Switch
                id="email-notifications"
                isChecked={enableEmailNotifications}
                onChange={handleToggleEmailNotifications}
                mr={3}
              />
              <Box>
                <FormLabel htmlFor="email-notifications" mb={0}>
                  แจ้งเตือนทางอีเมล
                </FormLabel>
                <Text fontSize="xs" color="gray.500">
                  รับการแจ้งเตือนสำคัญทางอีเมล
                </Text>
              </Box>
            </FormControl>

            {enableEmailNotifications && (
              <FormControl pl={10} isInvalid={!!emailError}>
                <FormLabel fontSize="sm">อีเมลสำหรับรับการแจ้งเตือน</FormLabel>
                <Input
                  name="emailAddress"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your-email@example.com"
                  size="sm"
                  type="email"
                  isRequired
                />
                {emailError && (
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                )}
                <Text fontSize="xs" color="gray.500" mt={1}>
                  หมายเหตุ: ระบบจะส่งอีเมลเฉพาะเมื่อมีการแจ้งเตือนสำคัญเท่านั้น
                  เช่น เมื่อพบสุนัขที่อาจตรงกับที่คุณหา
                  หรือเมื่อมีการอัพเดทสถานะสุนัขของคุณ
                </Text>
              </FormControl>
            )}
          </VStack>
        </Box>

        <Divider />

        <Box>
          <Heading size="sm" mb={2}>
            ข้อมูลการแจ้งเตือน
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            ขณะนี้ คุณจะได้รับการแจ้งเตือนในกรณีต่อไปนี้:
          </Text>

          <VStack spacing={2} align="stretch" pl={4}>
            <Text fontSize="sm">• เมื่อพบสุนัขที่อาจตรงกับที่คุณกำลังหา</Text>
            <Text fontSize="sm">• เมื่อมีการอัพเดทสถานะสุนัขของคุณ</Text>
            <Text fontSize="sm">• เมื่อมีผู้ใช้งานอื่นตอบกลับประกาศของคุณ</Text>
          </VStack>
        </Box>

        <Button
          colorScheme="brand"
          onClick={handleSave}
          isLoading={isLoading}
          alignSelf="flex-end"
          mt={4}
        >
          บันทึกการตั้งค่า
        </Button>
      </VStack>
    </Box>
  );
};

export default NotificationSettings;
