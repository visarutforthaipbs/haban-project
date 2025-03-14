import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiMapPin } from "react-icons/fi";

// Fix Leaflet default marker icon issue
const iconDefault = Icon.Default.prototype as {
  _getIconUrl?: string;
};
delete iconDefault._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number];
    name: string;
  }) => void;
  defaultLocation?: {
    coordinates: [number, number];
    name: string;
  };
}

const DEFAULT_CENTER: [number, number] = [18.7883, 98.9853]; // Chiang Mai coordinates

const LocationMarker = ({
  position,
  onPositionChange,
}: {
  position: LatLng | null;
  onPositionChange: (latlng: LatLng) => void;
}) => {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? <Marker position={position} /> : null;
};

export const LocationPicker = ({
  onLocationSelect,
  defaultLocation,
}: LocationPickerProps) => {
  const [position, setPosition] = useState<LatLng | null>(
    defaultLocation
      ? new LatLng(
          defaultLocation.coordinates[0],
          defaultLocation.coordinates[1]
        )
      : null
  );
  const [locationName, setLocationName] = useState(defaultLocation?.name || "");
  const [isLocating, setIsLocating] = useState(false);

  const handlePositionChange = (newPosition: LatLng) => {
    setPosition(newPosition);
  };

  const handleLocationSubmit = () => {
    if (position && locationName) {
      onLocationSelect({
        coordinates: [position.lat, position.lng],
        name: locationName,
      });
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = new LatLng(
            location.coords.latitude,
            location.coords.longitude
          );
          setPosition(newPosition);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <Stack spacing={4}>
      <Box height="300px" borderRadius="lg" overflow="hidden">
        <MapContainer
          center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </Box>

      <Button
        leftIcon={<FiMapPin />}
        onClick={getCurrentLocation}
        isLoading={isLocating}
        loadingText="กำลังระบุตำแหน่ง..."
      >
        ใช้ตำแหน่งปัจจุบัน
      </Button>

      <FormControl isRequired>
        <FormLabel>ชื่อสถานที่</FormLabel>
        <Input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="เช่น ใกล้ถนนนิมมานเหมินทร์, เมญ่า เชียงใหม่"
        />
      </FormControl>

      {position && (
        <Text fontSize="sm" color="gray.600">
          พิกัดที่เลือก: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </Text>
      )}

      <Button
        colorScheme="brand"
        onClick={handleLocationSubmit}
        isDisabled={!position || !locationName}
      >
        ยืนยันตำแหน่ง
      </Button>
    </Stack>
  );
};

export default LocationPicker;
