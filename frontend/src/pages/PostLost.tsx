import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LocationPicker } from "../components/LocationPicker";
import { dogApi } from "../services/api";

interface LostDogForm {
  name: string;
  breed: string;
  color: string;
  location: {
    coordinates: [number, number];
    name: string;
  } | null;
  description: string;
  contact: string;
  photos: FileList | null;
  lastSeen: string;
}

const initialForm: LostDogForm = {
  name: "",
  breed: "",
  color: "",
  location: null,
  description: "",
  contact: "",
  photos: null,
  lastSeen: new Date().toISOString().split("T")[0],
};

const PostLost = () => {
  const [form, setForm] = useState<LostDogForm>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LostDogForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LostDogForm, string>> = {};
    if (!form.name) newErrors.name = "กรุณาระบุชื่อสุนัข";
    if (!form.breed) newErrors.breed = "กรุณาระบุพันธุ์สุนัข";
    if (!form.color) newErrors.color = "กรุณาระบุสีสุนัข";
    if (!form.location) newErrors.location = "กรุณาระบุตำแหน่งที่พบ";
    if (!form.description) newErrors.description = "กรุณาระบุรายละเอียด";
    if (!form.contact && !user) newErrors.contact = "กรุณาระบุข้อมูลการติดต่อ";
    if (!form.lastSeen) newErrors.lastSeen = "กรุณาระบุวันที่พบสุนัขล่าสุด";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", "lost");
      formData.append("name", form.name);
      formData.append("breed", form.breed);
      formData.append("color", form.color);
      formData.append("description", form.description);
      formData.append("lastSeen", form.lastSeen);

      if (form.location) {
        formData.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [
              form.location.coordinates[1],
              form.location.coordinates[0],
            ], // Convert to [lng, lat]
          })
        );
        formData.append("locationName", form.location.name);
      }

      if (form.photos) {
        Array.from(form.photos).forEach((file) => {
          formData.append("photos", file);
        });
      }

      // Add user information if available
      if (user) {
        formData.append("userId", user.id);
        formData.append("userContact", user.email || "");
        if (user.contactInfo) {
          formData.append("userContactInfo", user.contactInfo);
        }
      } else if (form.contact) {
        formData.append("contact", form.contact);
      }

      await dogApi.createDog(formData);

      toast({
        title: "Report submitted",
        description: "Your lost dog report has been submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/map");
    } catch (err) {
      console.error("Error submitting report:", err);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LostDogForm]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({ ...prev, photos: e.target.files }));
    }
  };

  const handleLocationSelect = (location: {
    coordinates: [number, number];
    name: string;
  }) => {
    setForm((prev) => ({ ...prev, location }));
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" color="red.500" mb={2}>
            แจ้งสุนัขหาย
          </Heading>
          <Text color="gray.600" fontSize="lg">
            กรอกข้อมูลสุนัขที่หายเพื่อให้ผู้อื่นช่วยตามหา
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>ชื่อสุนัข</FormLabel>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ระบุชื่อสุนัข"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.breed}>
              <FormLabel>พันธุ์สุนัข</FormLabel>
              <Input
                name="breed"
                value={form.breed}
                onChange={handleChange}
                placeholder="ระบุพันธุ์สุนัข เช่น ไทยหลังอาน, ชิวาวา, โกลเด้น"
              />
              <FormErrorMessage>{errors.breed}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.color}>
              <FormLabel>สี</FormLabel>
              <Input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="ระบุสีขน เช่น น้ำตาล-ขาว, ดำ"
              />
              <FormErrorMessage>{errors.color}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.location}>
              <FormLabel>สถานที่พบครั้งสุดท้าย</FormLabel>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                defaultLocation={form.location || undefined}
              />
              <FormErrorMessage>{errors.location}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.lastSeen}>
              <FormLabel>วันที่พบเห็นล่าสุด</FormLabel>
              <Input
                type="date"
                name="lastSeen"
                value={form.lastSeen}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
              <FormErrorMessage>{errors.lastSeen}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ลักษณะพิเศษ ใส่ปลอกคอสีอะไร มีโรคประจำตัวหรือไม่"
                rows={4}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            {!user && (
              <FormControl isRequired isInvalid={!!errors.contact}>
                <FormLabel>ข้อมูลการติดต่อ</FormLabel>
                <Input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="ระบุเบอร์โทร, LINE ID หรือช่องทางติดต่ออื่นๆ"
                />
                <FormErrorMessage>{errors.contact}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>รูปภาพ</FormLabel>
              <Text fontSize="sm" color="gray.600" mb={2}>
                แนะนำให้อัพโหลดรูปที่เห็นตัวสุนัขชัดเจน หลายๆ มุม
              </Text>
              <Input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="red"
              size="lg"
              isLoading={isLoading}
              loadingText="กำลังส่งข้อมูล..."
            >
              แจ้งสุนัขหาย
            </Button>
          </Stack>
        </Box>
      </VStack>
    </Container>
  );
};

export default PostLost;
