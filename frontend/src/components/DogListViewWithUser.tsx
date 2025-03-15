import {
  Box,
  Flex,
  Image,
  Text,
  Badge,
  VStack,
  Divider,
  Button,
  SimpleGrid,
  Avatar,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { DogData } from "../services/api";
// import ShareButtons from "./ShareButtons"; // Temporarily removed

interface DogListViewProps {
  dogs: DogData[];
  selectedDog: DogData | null;
  onDogSelect: (dog: DogData) => void;
  columns?: { base: number; md: number; lg: number; xl: number };
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const DogListViewWithUser = ({
  dogs,
  selectedDog,
  onDogSelect,
  columns = { base: 1, md: 2, lg: 4, xl: 5 },
}: DogListViewProps) => {
  return (
    <SimpleGrid columns={columns} spacing={6}>
      {dogs.map((dog) => {
        return (
          <Box
            key={dog._id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => onDogSelect(dog)}
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "lg",
              border: selectedDog?._id === dog._id ? "3px solid" : "none",
              borderColor: "brand.500",
              pointerEvents: "none",
            }}
          >
            <Box position="relative" h="200px">
              <Image
                src={dog.photos?.[0] || "/dog-placeholder.png"}
                alt={dog.breed}
                objectFit="cover"
                w="100%"
                h="100%"
              />
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme={dog.type === "lost" ? "red" : "green"}
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="full"
              >
                {dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}
              </Badge>
            </Box>

            <Box p={4}>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="xl" fontWeight="bold">
                    {dog.name || dog.breed}
                  </Text>
                  <Badge
                    colorScheme={
                      dog.status === "active"
                        ? "green"
                        : dog.status === "resolved"
                        ? "blue"
                        : "gray"
                    }
                  >
                    {dog.status === "active"
                      ? "กำลังตามหา"
                      : dog.status === "resolved"
                      ? "พบเจอแล้ว"
                      : "หมดเวลา"}
                  </Badge>
                </Flex>

                {/* User information - simplified until backend is updated */}
                <HStack spacing={2} mt={1}>
                  <Avatar size="xs" name={"ผู้ใช้"} />
                  <Tooltip label="ข้อมูลผู้โพสต์" hasArrow>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                      ผู้ใช้งาน
                    </Text>
                  </Tooltip>
                </HStack>

                <VStack align="stretch" spacing={1}>
                  <Text>
                    <strong>พันธุ์:</strong> {dog.breed}
                  </Text>
                  <Text>
                    <strong>สี:</strong> {dog.color}
                  </Text>
                  <Text>
                    <strong>สถานที่:</strong> {dog.locationName}
                  </Text>
                  <Text>
                    <strong>
                      {dog.type === "lost" ? "หายเมื่อ" : "พบเมื่อ"}:
                    </strong>{" "}
                    {formatDate(
                      dog.type === "lost"
                        ? dog.lastSeen?.toString() || ""
                        : dog.foundDate?.toString() || ""
                    )}
                  </Text>
                </VStack>

                <Divider />

                <Text noOfLines={2} color="gray.600">
                  {dog.description}
                </Text>

                <Flex justifyContent="space-between" alignItems="center">
                  <Button
                    as={RouterLink}
                    to={`/dogs/${dog._id}`}
                    colorScheme="blue"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    ดูรายละเอียด
                  </Button>

                  {/* Share buttons temporarily removed */}
                </Flex>
              </VStack>
            </Box>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default DogListViewWithUser;
