import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  Badge,
  Button,
  HStack,
  VStack,
  useToast,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { dogApi, DogData } from "../services/api";
import { FiMapPin, FiCalendar, FiPhone } from "react-icons/fi";
import ShareButtons from "../components/ShareButtons";

const DogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<DogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchDog = async () => {
      try {
        if (id) {
          const dogData = await dogApi.getDog(id);
          setDog(dogData);
        }
      } catch (error) {
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

          {/* Share buttons */}
          <Flex justifyContent="flex-end" mt={2}>
            <ShareButtons
              title={`${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}: ${
                dog.name || dog.breed
              }`}
              description={`${dog.breed}, ${dog.color}, ${
                dog.locationName
              }. ${dog.description.substring(0, 100)}${
                dog.description.length > 100 ? "..." : ""
              }`}
              url={`/dogs/${dog._id}`}
            />
          </Flex>
        </Box>

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
          {user && user.id === dog.userId && (
            <HStack justify="flex-end" pt={4}>
              <Button
                colorScheme={dog.status === "active" ? "blue" : "green"}
                onClick={async () => {
                  try {
                    const newStatus =
                      dog.status === "active" ? "resolved" : "active";
                    await dogApi.updateDogStatus(dog._id, newStatus);
                    setDog((prev) =>
                      prev ? { ...prev, status: newStatus } : null
                    );
                    toast({
                      title: "Status updated",
                      status: "success",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error updating status",
                      status: "error",
                      duration: 3000,
                    });
                  }
                }}
              >
                {dog.status === "active"
                  ? "ทำเครื่องหมายว่าพบแล้ว"
                  : "เปิดการค้นหาอีกครั้ง"}
              </Button>
            </HStack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default DogDetails;
