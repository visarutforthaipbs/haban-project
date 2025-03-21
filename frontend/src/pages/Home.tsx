import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Badge,
  Container,
  Flex,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiSearch,
  FiMap,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import { DogData, dogApi } from "../services/api";
import DogListViewWithUser from "../components/DogListViewWithUser";
import { PotentialMatches } from "../components/PotentialMatches";

// Custom markers for lost and found dogs
const lostDogIcon = new Icon({
  iconUrl: "/marker-lost-custom.svg",
  iconSize: [40, 57],
  iconAnchor: [20, 57],
  popupAnchor: [0, -50],
});

const foundDogIcon = new Icon({
  iconUrl: "/marker-found-custom.svg",
  iconSize: [40, 57],
  iconAnchor: [20, 57],
  popupAnchor: [0, -50],
});

// Selected marker icons with different style
const selectedLostDogIcon = new Icon({
  iconUrl: "/marker-lost-custom.svg",
  iconSize: [50, 71],
  iconAnchor: [25, 71],
  popupAnchor: [0, -65],
});

const selectedFoundDogIcon = new Icon({
  iconUrl: "/marker-found-custom.svg",
  iconSize: [50, 71],
  iconAnchor: [25, 71],
  popupAnchor: [0, -65],
});

const DEFAULT_CENTER: [number, number] = [18.7883, 98.9853]; // Chiang Mai coordinates

// Map component that handles centering on selected marker
const MapComponent = ({ selectedDog }: { selectedDog: DogData | null }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDog) {
      map.setView(
        new LatLng(
          selectedDog.location.coordinates[1],
          selectedDog.location.coordinates[0]
        ),
        15
      );
    }
  }, [selectedDog, map]);

  return null;
};

const Home = () => {
  const [recentDogs, setRecentDogs] = useState<DogData[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<DogData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDog, setSelectedDog] = useState<DogData | null>(null);
  const [filters, setFilters] = useState({
    type: [] as string[],
    status: ["active"] as string[],
  });
  const listingsRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 12; // Adjust based on your design needs

  const fetchDogs = useCallback(async () => {
    try {
      // Build API params based on current filters
      const params: {
        type?: "lost" | "found";
        status?: "active" | "resolved" | "expired";
      } = {};

      // Only add type filter if something is selected
      if (filters.type.length === 1) {
        params.type = filters.type[0] as "lost" | "found";
      }

      // Only add status filter if something is selected
      if (filters.status.length === 1) {
        params.status = filters.status[0] as "active" | "resolved" | "expired";
      }

      const response = await dogApi.getDogs(params);
      setRecentDogs(response);
      setFilteredDogs(response);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  useEffect(() => {
    let filtered = recentDogs;

    // Apply search filter (this remains client-side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dog) =>
          dog.breed.toLowerCase().includes(query) ||
          dog.color.toLowerCase().includes(query) ||
          dog.locationName.toLowerCase().includes(query) ||
          (dog.name && dog.name.toLowerCase().includes(query))
      );
    }

    // We no longer need to filter by type and status here
    // as the API is now handling that filtering

    setFilteredDogs(filtered);
  }, [searchQuery, recentDogs]);

  const handleDogSelect = (dog: DogData) => {
    setSelectedDog(dog);
    // Scroll the selected dog into view if it's in the listings
    if (listingsRef.current) {
      const dogElement = listingsRef.current.querySelector(
        `[data-dog-id="${dog._id}"]`
      );
      if (dogElement) {
        dogElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Calculate pagination
  const indexOfLastDog = currentPage * dogsPerPage;
  const indexOfFirstDog = indexOfLastDog - dogsPerPage;
  const currentDogs = filteredDogs.slice(indexOfFirstDog, indexOfLastDog);
  const totalPages = Math.ceil(filteredDogs.length / dogsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of list when page changes
    if (listingsRef.current) {
      listingsRef.current.scrollTop = 0;
    }
  };

  // Generate pagination buttons with ellipses for large page counts
  const getPaginationButtons = () => {
    const maxButtons = 5; // Maximum number of page buttons to show
    const buttons = [];

    // Always show first page
    buttons.push(
      <Button
        key={1}
        size="sm"
        variant={currentPage === 1 ? "solid" : "outline"}
        colorScheme={currentPage === 1 ? "brand" : "gray"}
        onClick={() => handlePageChange(1)}
        minW="32px"
      >
        1
      </Button>
    );

    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxButtons - 3);

    if (endPage - startPage < maxButtons - 3) {
      startPage = Math.max(2, endPage - (maxButtons - 3));
    }

    // Add ellipsis if there's a gap after first page
    if (startPage > 2) {
      buttons.push(
        <Text key="ellipsis-1" fontSize="sm" px={1}>
          ...
        </Text>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          variant={currentPage === i ? "solid" : "outline"}
          colorScheme={currentPage === i ? "brand" : "gray"}
          onClick={() => handlePageChange(i)}
          minW="32px"
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      buttons.push(
        <Text key="ellipsis-2" fontSize="sm" px={1}>
          ...
        </Text>
      );
    }

    // Always show last page if there are at least 2 pages
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          size="sm"
          variant={currentPage === totalPages ? "solid" : "outline"}
          colorScheme={currentPage === totalPages ? "brand" : "gray"}
          onClick={() => handlePageChange(totalPages)}
          minW="32px"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Box minH="100vh">
      {/* Search and Filter Section */}
      <Box bg="white" py={2} borderBottom="1px" borderColor={borderColor}>
        <Box maxW="100%" px={{ base: 4, md: 6, lg: 8 }} mx="auto">
          <HStack spacing={4} justify="space-between">
            <InputGroup maxW={{ base: "100%", md: "600px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาสุนัข..."
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} leftIcon={<FiFilter />} variant="outline">
                ตัวกรอง
              </MenuButton>
              <MenuList minWidth="240px">
                <MenuOptionGroup
                  title="ประเภท"
                  type="checkbox"
                  value={filters.type}
                  onChange={(value) => {
                    setFilters({ ...filters, type: value as string[] });
                    // Clear search when filters change to avoid confusion
                    setSearchQuery("");
                  }}
                >
                  <MenuItemOption value="lost">สุนัขหาย</MenuItemOption>
                  <MenuItemOption value="found">พบสุนัข</MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  title="สถานะ"
                  type="checkbox"
                  value={filters.status}
                  onChange={(value) => {
                    setFilters({ ...filters, status: value as string[] });
                    // Clear search when filters change to avoid confusion
                    setSearchQuery("");
                  }}
                >
                  <MenuItemOption value="active">กำลังค้นหา</MenuItemOption>
                  <MenuItemOption value="resolved">พบเจอแล้ว</MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </HStack>
        </Box>
      </Box>

      <Container maxW="100%" px={{ base: 4, md: 6, lg: 8 }} py={8}>
        <SimpleGrid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          spacing={6}
          minH="600px"
          h={{ base: "auto", lg: "calc(100vh - 200px)" }}
        >
          {/* Left Column - Listings */}
          <Box
            ref={listingsRef}
            gridColumn={{ base: "1", lg: "1" }}
            overflowY="auto"
            borderRight={{ base: "none", lg: "1px" }}
            borderColor={borderColor}
            bg="white"
            h="100%"
            w="100%"
            css={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                width: "8px",
                backgroundColor: "var(--chakra-colors-gray-100)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--chakra-colors-gray-300)",
                borderRadius: "24px",
              },
              // Firefox scrollbar styling
              scrollbarWidth: "thin",
              scrollbarColor:
                "var(--chakra-colors-gray-300) var(--chakra-colors-gray-100)",
            }}
          >
            <Box p={4}>
              <Heading size="md" mb={4}>
                รายการล่าสุด
                {filteredDogs.length > 0 && (
                  <Text
                    as="span"
                    fontSize="sm"
                    fontWeight="normal"
                    ml={2}
                    color="gray.500"
                  >
                    ({filteredDogs.length} รายการ)
                  </Text>
                )}
              </Heading>
              <DogListViewWithUser
                dogs={currentDogs}
                selectedDog={selectedDog}
                onDogSelect={handleDogSelect}
                columns={{ base: 1, md: 2, lg: 2, xl: 3 }}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex justify="center" mt={6} align="center">
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    mr={2}
                    leftIcon={<FiChevronLeft />}
                  >
                    ก่อนหน้า
                  </Button>

                  <HStack spacing={1}>{getPaginationButtons()}</HStack>

                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    ml={2}
                    rightIcon={<FiChevronRight />}
                  >
                    ถัดไป
                  </Button>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Right Column - Map */}
          <Box
            position="relative"
            h={{ base: "400px", lg: "100%" }}
            gridColumn={{ base: "1", lg: "2" }}
            w="100%"
          >
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <MapComponent selectedDog={selectedDog} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {filteredDogs.map((dog) => (
                <Marker
                  key={dog._id}
                  position={[
                    dog.location.coordinates[1],
                    dog.location.coordinates[0],
                  ]}
                  icon={
                    selectedDog?._id === dog._id
                      ? dog.type === "lost"
                        ? selectedLostDogIcon
                        : selectedFoundDogIcon
                      : dog.type === "lost"
                      ? lostDogIcon
                      : foundDogIcon
                  }
                  eventHandlers={{
                    click: () => handleDogSelect(dog),
                  }}
                >
                  <Popup>
                    <Box className="custom-popup" p={2} maxW="200px">
                      <VStack align="stretch" spacing={2}>
                        {/* Type badge */}
                        <Badge
                          colorScheme={dog.type === "lost" ? "red" : "green"}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          alignSelf="flex-start"
                        >
                          {dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}
                        </Badge>

                        {/* Dog name and breed */}
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {dog.name || dog.breed}
                        </Text>

                        {/* Location - most important info */}
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {dog.locationName}
                        </Text>

                        {/* Details button */}
                        <Button
                          as={RouterLink}
                          to={`/dogs/${dog._id}`}
                          size="xs"
                          colorScheme="brand"
                          width="full"
                          mt={1}
                        >
                          ดูรายละเอียด
                        </Button>
                      </VStack>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <Button
              as={RouterLink}
              to="/map"
              position="absolute"
              bottom={4}
              right={4}
              leftIcon={<FiMap />}
              colorScheme="brand"
              size="lg"
              zIndex={1000}
              bg="white"
              color="gray.800"
              _hover={{ bg: "gray.100" }}
              boxShadow="md"
            >
              เปิดแผนที่เต็ม
            </Button>
          </Box>
        </SimpleGrid>

        {/* Potential Matches */}
        {selectedDog && (
          <PotentialMatches
            selectedDog={selectedDog}
            allDogs={recentDogs}
            onMatchSelect={handleDogSelect}
          />
        )}
      </Container>
    </Box>
  );
};

export default Home;
