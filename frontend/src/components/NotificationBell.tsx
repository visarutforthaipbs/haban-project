import React from "react";
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  BoxProps,
} from "@chakra-ui/react";
import { FiBell, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  Notification,
} from "../contexts/NotificationContext";

const NotificationItem: React.FC<{
  notification: Notification;
  onItemClick: (notification: Notification) => void;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
}> = ({ notification, onItemClick, onMarkAsRead }) => {
  const bgColor = useColorModeValue(
    notification.read ? "white" : "gray.50",
    notification.read ? "gray.800" : "gray.700"
  );

  return (
    <Box
      py={2}
      px={3}
      onClick={() => onItemClick(notification)}
      bg={bgColor}
      _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
      borderLeft={notification.read ? "none" : "3px solid"}
      borderLeftColor="brand.500"
      cursor="pointer"
      role="group"
    >
      <VStack align="stretch" spacing={1} width="100%">
        <HStack justifyContent="space-between">
          <Text
            fontWeight={notification.read ? "medium" : "bold"}
            fontSize="sm"
          >
            {notification.title}
          </Text>
          {!notification.read && (
            <Flex
              p={1}
              borderRadius="md"
              _hover={{ bg: "gray.200" }}
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id, e);
              }}
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              title="Mark as read"
            >
              <Icon as={FiCheck} boxSize={3} />
            </Flex>
          )}
        </HStack>
        <Text fontSize="xs" color="gray.500" noOfLines={2}>
          {notification.message}
        </Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          {new Date(notification.createdAt).toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </VStack>
    </Box>
  );
};

interface NotificationBellProps extends BoxProps {}

const NotificationBell: React.FC<NotificationBellProps> = (props) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
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

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    markAsRead(notificationId);
  };

  return (
    <Box {...props}>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={IconButton}
          aria-label="Notifications"
          icon={<FiBell />}
          variant="ghost"
          position="relative"
          color={unreadCount > 0 ? "brand.500" : undefined}
        >
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-1px"
              right="-1px"
              fontSize="xs"
            >
              {unreadCount}
            </Badge>
          )}
        </MenuButton>
        <MenuList zIndex={100} minW="300px" maxH="400px" overflowY="auto">
          <Box px={4} py={2} borderBottomWidth="1px">
            <HStack justify="space-between">
              <Text fontWeight="bold">การแจ้งเตือน</Text>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  colorScheme="brand"
                  variant="outline"
                  onClick={() => markAllAsRead()}
                >
                  อ่านทั้งหมด
                </Button>
              )}
            </HStack>
          </Box>

          {notifications.length === 0 ? (
            <Box py={6} textAlign="center">
              <Text color="gray.500">ไม่มีการแจ้งเตือน</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onItemClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </VStack>
          )}

          <Divider />
          <Box py={2} px={3}>
            <Button
              size="sm"
              width="100%"
              variant="ghost"
              onClick={() => navigate("/notifications")}
            >
              ดูการแจ้งเตือนทั้งหมด
            </Button>
          </Box>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default NotificationBell;
