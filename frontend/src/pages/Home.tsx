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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiSearch, FiMap, FiFilter } from "react-icons/fi";
import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import { DogData, dogApi } from "../services/api";
import DogListView from "../components/DogListView";
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
          >
            <Box p={4}>
              <Heading size="md" mb={4}>
                รายการล่าสุด
              </Heading>
              <DogListView
                dogs={filteredDogs}
                selectedDog={selectedDog}
                onDogSelect={handleDogSelect}
                columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              />
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
