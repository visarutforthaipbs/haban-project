import React, { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Flex,
  useColorModeValue,
  Icon,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiMessageCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  useNotifications,
  Notification,
} from "../contexts/NotificationContext";
import NotificationSettings from "../components/NotificationSettings";

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onSelect: (notification: Notification) => void;
}> = ({ notification, onMarkAsRead, onMarkAsUnread, onSelect }) => {
  const bgColor = useColorModeValue(
    notification.read ? "white" : "gray.50",
    notification.read ? "gray.800" : "gray.700"
  );

  // Set icon based on notification type
  let icon;
  let typeColor;

  switch (notification.type) {
    case "match":
      icon = FiAlertCircle;
      typeColor = "orange.500";
      break;
    case "status_update":
      icon = FiCheckCircle;
      typeColor = "green.500";
      break;
    case "comment":
      icon = FiMessageCircle;
      typeColor = "blue.500";
      break;
    default:
      icon = FiAlertCircle;
      typeColor = "gray.500";
  }

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderLeft={notification.read ? "none" : "4px solid"}
      borderColor="brand.500"
      _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
      cursor="pointer"
      onClick={() => onSelect(notification)}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <HStack spacing={4} flex={1}>
          <Icon as={icon} boxSize={5} color={typeColor} />
          <Box flex={1}>
            <Text fontWeight={notification.read ? "medium" : "bold"}>
              {notification.title}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {notification.message}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={2}>
              {new Date(notification.createdAt).toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Box>
        </HStack>

        <HStack spacing={1}>
          {notification.read ? (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiX />}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsUnread(notification._id);
              }}
            >
              ทำเครื่องหมายว่ายังไม่ได้อ่าน
            </Button>
          ) : (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiCheck />}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
            >
              ทำเครื่องหมายว่าอ่านแล้ว
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  // For demo purposes only - in a real implementation, marking as unread would be part of the notification context
  const [markedUnreadIds, setMarkedUnreadIds] = useState<string[]>([]);

  // Filter notifications by tab
  const allNotifications = notifications.map((notification) => {
    // Apply local unread state if in markedUnreadIds
    if (markedUnreadIds.includes(notification._id)) {
      return { ...notification, read: false };
    }
    return notification;
  });

  const unreadNotifications = allNotifications.filter(
    (notification) => !notification.read
  );
  const readNotifications = allNotifications.filter(
    (notification) => notification.read
  );

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    // Remove from locally marked unread if present
    setMarkedUnreadIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleMarkAsUnread = (id: string) => {
    // For demo, just track locally which ones are marked unread
    setMarkedUnreadIds((prev) => [...prev, id]);
  };

  const handleNotificationSelect = (notification: Notification) => {
    // Mark as read
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.type === "match" && notification.data.dogId) {
      navigate(`/dogs/${notification.data.dogId}`);
    } else if (
      notification.type === "status_update" &&
      notification.data.dogId
    ) {
      navigate(`/dogs/${notification.data.dogId}`);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Tabs
        isFitted
        colorScheme="brand"
        index={tabIndex}
        onChange={setTabIndex}
      >
        <TabList mb={4}>
          <Tab>
            ทั้งหมด
            <Badge
              ml={2}
              colorScheme="brand"
              variant="solid"
              borderRadius="full"
            >
              {allNotifications.length}
            </Badge>
          </Tab>
          <Tab>
            ยังไม่ได้อ่าน
            <Badge ml={2} colorScheme="red" variant="solid" borderRadius="full">
              {unreadNotifications.length}
            </Badge>
          </Tab>
          <Tab>
            อ่านแล้ว
            <Badge
              ml={2}
              colorScheme="gray"
              variant="solid"
              borderRadius="full"
            >
              {readNotifications.length}
            </Badge>
          </Tab>
          <Tab>ตั้งค่า</Tab>
        </TabList>

        <TabPanels>
          {/* All Notifications */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="lg" shadow="sm">
              <Flex
                justify="space-between"
                align="center"
                p={4}
                borderBottomWidth="1px"
              >
                <Heading size="md">การแจ้งเตือนทั้งหมด</Heading>
                {unreadNotifications.length > 0 && (
                  <Button size="sm" onClick={markAllAsRead}>
                    ทำเครื่องหมายว่าอ่านทั้งหมด
                  </Button>
                )}
              </Flex>

              {allNotifications.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  ไม่มีการแจ้งเตือน
                </Alert>
              ) : (
                <VStack spacing={1} align="stretch" divider={<Divider />}>
                  {allNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onSelect={handleNotificationSelect}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </TabPanel>

          {/* Unread Notifications */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="lg" shadow="sm">
              <Flex
                justify="space-between"
                align="center"
                p={4}
                borderBottomWidth="1px"
              >
                <Heading size="md">การแจ้งเตือนที่ยังไม่ได้อ่าน</Heading>
                {unreadNotifications.length > 0 && (
                  <Button size="sm" onClick={markAllAsRead}>
                    ทำเครื่องหมายว่าอ่านทั้งหมด
                  </Button>
                )}
              </Flex>

              {unreadNotifications.length === 0 ? (
                <Alert status="success" p={4}>
                  <AlertIcon />
                  ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน
                </Alert>
              ) : (
                <VStack spacing={1} align="stretch" divider={<Divider />}>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onSelect={handleNotificationSelect}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </TabPanel>

          {/* Read Notifications */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="lg" shadow="sm">
              <Flex
                justify="space-between"
                align="center"
                p={4}
                borderBottomWidth="1px"
              >
                <Heading size="md">การแจ้งเตือนที่อ่านแล้ว</Heading>
              </Flex>

              {readNotifications.length === 0 ? (
                <Alert status="info" p={4}>
                  <AlertIcon />
                  ไม่มีการแจ้งเตือนที่อ่านแล้ว
                </Alert>
              ) : (
                <VStack spacing={1} align="stretch" divider={<Divider />}>
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onSelect={handleNotificationSelect}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel p={0}>
            <NotificationSettings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default NotificationsPage;
