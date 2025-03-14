import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiSearch, FiFilter, FiList, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";
import { DogData, dogApi } from "../services/api";
import DogListView from "../components/DogListView";
import { PotentialMatches } from "../components/PotentialMatches";

// Use custom marker icons for lost and found dogs
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

const MapPage = () => {
  const [recentDogs, setRecentDogs] = useState<DogData[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<DogData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDog, setSelectedDog] = useState<DogData | null>(null);
  const [filters, setFilters] = useState({
    type: [] as string[],
    status: ["active"],
  });

  const borderColor = useColorModeValue("gray.100", "gray.700");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const showSidebar = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    const fetchRecentDogs = async () => {
      try {
        const response = await dogApi.getDogs({ status: "active" });
        setRecentDogs(response);
        setFilteredDogs(response);
      } catch (error) {
        console.error("Error fetching recent dogs:", error);
      }
    };

    fetchRecentDogs();
  }, []);

  useEffect(() => {
    let filtered = recentDogs;

    // Apply search filter
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

    // Apply type and status filters
    if (filters.type.length > 0) {
      filtered = filtered.filter((dog) => filters.type.includes(dog.type));
    }
    if (filters.status.length > 0) {
      filtered = filtered.filter((dog) => filters.status.includes(dog.status));
    }

    setFilteredDogs(filtered);
  }, [searchQuery, filters, recentDogs]);

  const handleDogSelect = (dog: DogData) => {
    setSelectedDog(dog);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <VStack h="100%" spacing={4} align="stretch">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="ค้นหาสุนัข..."
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
            onChange={(value) =>
              setFilters({ ...filters, type: value as string[] })
            }
          >
            <MenuItemOption value="lost">สุนัขหาย</MenuItemOption>
            <MenuItemOption value="found">พบสุนัข</MenuItemOption>
          </MenuOptionGroup>
          <MenuOptionGroup
            title="สถานะ"
            type="checkbox"
            value={filters.status}
            onChange={(value) =>
              setFilters({ ...filters, status: value as string[] })
            }
          >
            <MenuItemOption value="active">กำลังค้นหา</MenuItemOption>
            <MenuItemOption value="resolved">พบเจอแล้ว</MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>

      <Box flex="1" overflowY="auto">
        <DogListView
          dogs={filteredDogs}
          selectedDog={selectedDog}
          onDogSelect={handleDogSelect}
          columns={{ base: 1, md: 1, lg: 1 }}
        />
      </Box>
    </VStack>
  );

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" py={4} borderBottom="1px" borderColor={borderColor}>
        <VStack spacing={3} px={4}>
          <Heading size="lg" textAlign="center" color="brand.500">
            แผนที่สุนัขหาย/พบในเชียงใหม่
          </Heading>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" display="flex" position="relative">
        {/* Sidebar - Desktop */}
        {showSidebar && (
          <Box
            w="400px"
            h="100%"
            borderRight="1px"
            borderColor={borderColor}
            bg="white"
            p={4}
            overflowY="auto"
          >
            <SidebarContent />
          </Box>
        )}

        {/* Map Container */}
        <Box flex="1" position="relative">
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

          {/* Mobile Toggle Button */}
          {isMobile && (
            <IconButton
              aria-label="Toggle Sidebar"
              icon={isOpen ? <FiX /> : <FiList />}
              position="absolute"
              top={4}
              right={4}
              onClick={isOpen ? onClose : onOpen}
              colorScheme="brand"
              size="lg"
              zIndex={1000}
              bg="white"
              color="gray.800"
              _hover={{ bg: "gray.100" }}
              boxShadow="md"
            />
          )}
        </Box>

        {/* Sidebar - Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              รายการสุนัขในพื้นที่
            </DrawerHeader>
            <DrawerBody p={4}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* Potential Matches */}
      {selectedDog && (
        <PotentialMatches
          selectedDog={selectedDog}
          allDogs={recentDogs}
          onMatchSelect={handleDogSelect}
        />
      )}
    </Box>
  );
};

export default MapPage;
