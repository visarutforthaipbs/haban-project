import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Container,
  Link,
  AspectRatio,
  Divider,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  Tag,
  Stack,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
// import ShareButtons from "../components/ShareButtons"; // Temporarily removed
import { FaMapMarkerAlt, FaCalendarAlt, FaPhoneAlt } from "react-icons/fa";
import { IoPawOutline } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { MapContainer } from "../components/MapContainer";
import { API_URL } from "../config";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../contexts/AuthContext";
import ContactInfoModal from "../components/ContactInfoModal";
import MatchingDogsSection from "../components/MatchingDogsSection";
import {
  FiMapPin,
  FiCalendar,
  FiPhone,
  FiUser,
  FiBookmark,
  FiCheck,
} from "react-icons/fi";
import ShareButtons from "../components/ShareButtons";
import axios from "axios";

// Types
import { DogData, DogStatusUpdate } from "../types/Dog";
import { dogApi } from "../services/api";

// User information interface
interface UserInfo {
  id: string;
  name: string;
  profileImage?: string;
  bio?: string;
}

const DogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<DogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [statusLoading, setStatusLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  useEffect(() => {
    const fetchDog = async () => {
      try {
        if (id) {
          const dogData = await dogApi.getDog(id);
          setDog(dogData);

          // Fetch user info if there's a userId
          if (dogData.userId) {
            setIsLoadingUser(true);
            try {
              const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/${dogData.userId}`
              );
              if (response.data) {
                setUserInfo(response.data);
              }
            } catch (error) {
              console.error(
                `Error fetching user info for ${dogData.userId}:`,
                error
              );
            } finally {
              setIsLoadingUser(false);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching dog details:", err);
        toast({
          title: "Error",
          description: "Failed to load dog details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDog();
  }, [id, toast]);

  useEffect(() => {
    const checkIfDogIsSaved = async () => {
      if (!isAuthenticated || !id) return;

      try {
        // Get user's saved dogs
        const savedDogs = await dogApi.getSavedDogs();
        // Check if current dog is in saved dogs
        setIsSaved(savedDogs.some((savedDog) => savedDog._id === id));
      } catch (error) {
        console.error("Error checking if dog is saved:", error);
      }
    };

    checkIfDogIsSaved();
  }, [id, isAuthenticated]);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "ไม่ระบุ";
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Move the useEffect for document title and meta tags here, before any conditional returns
  useEffect(() => {
    if (!dog) return;

    // Create metadata for sharing
    const pageTitle = `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}: ${
      dog.name || dog.breed
    } | haban.love`;
    const pageDescription = `${dog.breed}, ${dog.color}, ${
      dog.locationName
    }. ${dog.description.substring(0, 150)}${
      dog.description.length > 150 ? "..." : ""
    }`;
    const pageImage =
      dog.photos && dog.photos.length > 0
        ? dog.photos[0]
        : "https://www.haban.love/fbthumnail-1.png";
    const pageUrl = `${window.location.origin}/dogs/${dog._id}`;

    // Set document title
    document.title = pageTitle;

    // Set meta tags
    const metaTags = {
      description: pageDescription,
      "og:url": pageUrl,
      "og:type": "article",
      "og:title": pageTitle,
      "og:description": pageDescription,
      "og:image": pageImage,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:locale": "th_TH",
      "fb:app_id": "297302183484420",
      "twitter:card": "summary_large_image",
      "twitter:title": pageTitle,
      "twitter:description": pageDescription,
      "twitter:image": pageImage,
    };

    // Update or create meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta =
        document.querySelector(`meta[property="${name}"]`) ||
        document.querySelector(`meta[name="${name}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("fb:")) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    });

    // Cleanup function to restore default title when component unmounts
    return () => {
      document.title = "haban.love";
    };
  }, [dog]);

  // Define the meta title and image for helmet only
  const pageTitle = dog
    ? `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}: ${
        dog.name || dog.breed
      } - haban.love`
    : "กำลังโหลด... - haban.love";

  // Define the meta image (used for helmet, not for share buttons now)
  const pageImage = dog?.photos && dog.photos.length > 0 ? dog.photos[0] : null;

  // Button click handler
  const handleStatusUpdate = async () => {
    if (!dog) return;

    try {
      const newStatus = dog.status === "active" ? "resolved" : "active";
      await dogApi.updateDogStatus(dog._id, newStatus);
      setDog((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast({
        title: "Status updated",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error updating status",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถบันทึกรายการได้",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!id) return;

    setIsSaveLoading(true);
    try {
      if (isSaved) {
        await dogApi.unsaveDog(id);
        setIsSaved(false);
        toast({
          title: "ยกเลิกการบันทึกสำเร็จ",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        await dogApi.saveDog(id);
        setIsSaved(true);
        toast({
          title: "บันทึกรายการสำเร็จ",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
      toast({
        title: isSaved
          ? "ไม่สามารถยกเลิกการบันทึกได้"
          : "ไม่สามารถบันทึกรายการได้",
        description: "โปรดลองอีกครั้งในภายหลัง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">Loading...</Box>
      </Container>
    );
  }

  if (!dog) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">Dog not found</Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8}>
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading
              size="xl"
              color={dog.type === "lost" ? "red.500" : "green.500"}
            >
              {dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}:{" "}
              {dog.name || dog.breed}
            </Heading>
            <Badge
              colorScheme={
                dog.status === "active"
                  ? "green"
                  : dog.status === "resolved"
                  ? "blue"
                  : "gray"
              }
              fontSize="md"
              px={3}
              py={1}
              borderRadius="full"
            >
              {dog.status === "active"
                ? "กำลังตามหา"
                : dog.status === "resolved"
                ? "พบเจอแล้ว"
                : "หมดเวลา"}
            </Badge>
          </HStack>
        </Box>

        {/* User information */}
        {dog.userId && (
          <Box bg="gray.50" p={4} borderRadius="lg" shadow="sm">
            <HStack spacing={4}>
              <FiUser />
              <Text fontWeight="medium">โพสต์โดย:</Text>
              {isLoadingUser ? (
                <Spinner size="sm" />
              ) : userInfo ? (
                <HStack>
                  <Avatar
                    size="sm"
                    name={userInfo.name}
                    src={userInfo.profileImage}
                  />
                  <Text>{userInfo.name}</Text>
                </HStack>
              ) : (
                <Text>ผู้ใช้งาน</Text>
              )}
            </HStack>
          </Box>
        )}

        {/* Images */}
        {dog.photos && dog.photos.length > 0 && (
          <Box
            borderRadius="lg"
            overflow="hidden"
            maxH="500px"
            position="relative"
          >
            <Image
              src={dog.photos[0]}
              alt={dog.breed}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          </Box>
        )}

        {/* Details */}
        <Stack spacing={6} bg="white" p={6} borderRadius="lg" shadow="sm">
          <VStack align="stretch" spacing={4}>
            <HStack>
              <FiCalendar />
              <Text>
                <strong>{dog.type === "lost" ? "หายเมื่อ" : "พบเมื่อ"}:</strong>{" "}
                {formatDate(dog.type === "lost" ? dog.lastSeen : dog.foundDate)}
              </Text>
            </HStack>

            <HStack>
              <FiMapPin />
              <Text>
                <strong>สถานที่:</strong> {dog.locationName}
              </Text>
            </HStack>

            <Divider />

            <Box>
              <Text>
                <strong>พันธุ์:</strong> {dog.breed}
              </Text>
              <Text>
                <strong>สี:</strong> {dog.color}
              </Text>
              {dog.type === "found" && dog.currentStatus && (
                <Text>
                  <strong>สถานะปัจจุบัน:</strong>{" "}
                  {dog.currentStatus === "temporary"
                    ? "รับเลี้ยงชั่วคราว"
                    : "อยู่ที่ศูนย์พักพิง"}
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                รายละเอียดเพิ่มเติม:
              </Text>
              <Text whiteSpace="pre-wrap">{dog.description}</Text>
            </Box>

            {(dog.contact || dog.userContact) && (
              <>
                <Divider />
                <Box>
                  <HStack>
                    <FiPhone />
                    <Text>
                      <strong>ติดต่อ:</strong>{" "}
                      {dog.contact ||
                        (dog.userContactInfo
                          ? `${dog.userContact} (${dog.userContactInfo})`
                          : dog.userContact)}
                    </Text>
                  </HStack>
                </Box>
              </>
            )}
          </VStack>

          {/* Actions */}
          <HStack justify="flex-end" pt={4} spacing={4}>
            {user && user.id === dog.userId && (
              <Button
                colorScheme={dog.status === "active" ? "blue" : "green"}
                onClick={handleStatusUpdate}
              >
                {dog.status === "active"
                  ? "ทำเครื่องหมายว่าพบแล้ว"
                  : "เปิดการค้นหาอีกครั้ง"}
              </Button>
            )}

            {isAuthenticated && (
              <Button
                size="sm"
                colorScheme={isSaved ? "green" : "gray"}
                variant="outline"
                leftIcon={isSaved ? <FiCheck /> : <FiBookmark />}
                onClick={handleToggleSave}
                isLoading={isSaveLoading}
              >
                {isSaved ? "บันทึกแล้ว" : "บันทึก"}
              </Button>
            )}
          </HStack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default DogDetails;
