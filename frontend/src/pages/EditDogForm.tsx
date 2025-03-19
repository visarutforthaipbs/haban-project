import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { dogApi } from "../services/api";

// Define the FormData interface
interface FormData {
  name: string;
  breed: string;
  age: string;
  gender: string;
  color: string;
  size: string;
  description: string;
  location: string;
  userContact: string;
  userContactInfo: string;
  status: string;
  lastSeenDate: string;
  lastSeenLocation: string;
  images: string[];
}

const EditDogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data with empty values
  const [formData, setFormData] = useState<FormData>({
    name: "",
    breed: "",
    age: "",
    gender: "",
    color: "",
    size: "",
    description: "",
    location: "",
    userContact: "",
    userContactInfo: "",
    status: "",
    lastSeenDate: "",
    lastSeenLocation: "",
    images: [],
  });

  useEffect(() => {
    const fetchDog = async () => {
      try {
        if (!id) return;

        const dogData = await dogApi.getDog(id);

        // Check if current user is the owner
        if (user?.id !== dogData.userId) {
          toast({
            title: "ไม่สามารถแก้ไขข้อมูลได้",
            description: "คุณสามารถแก้ไขได้เฉพาะประกาศของคุณเท่านั้น",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          navigate(`/dogs/${id}`);
          return;
        }

        // Format date for input field if exists
        let formattedDate = "";
        if (dogData.lastSeen) {
          const date = new Date(dogData.lastSeen);
          formattedDate = date.toISOString().split("T")[0];
        }

        // Access custom fields, if available, using type assertion
        const customDogData = dogData as any;

        // Transform API data to form data format
        setFormData({
          name: dogData.name || "",
          breed: dogData.breed || "",
          // Use custom fields if available, otherwise use empty string
          age: customDogData.age || "",
          gender: customDogData.gender || "",
          color: dogData.color || "",
          size: customDogData.size || "",
          description: dogData.description || "",
          location: dogData.locationName || "",
          userContact: dogData.userContact || "",
          userContactInfo: dogData.userContactInfo || "",
          status: dogData.status || "",
          lastSeenDate: formattedDate,
          // Use custom location if available
          lastSeenLocation: customDogData.lastSeenLocation || "",
          images: dogData.photos || [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dog details:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสุนัขได้",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/");
      }
    };

    fetchDog();
  }, [id, navigate, toast, user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    setSubmitting(true);

    try {
      // Create FormData object for multipart/form-data submission
      const formDataObj = new FormData();

      // Add standard fields to FormData
      formDataObj.append("name", formData.name);
      formDataObj.append("breed", formData.breed);
      formDataObj.append("color", formData.color);
      formDataObj.append("description", formData.description);
      formDataObj.append("locationName", formData.location);
      formDataObj.append("userContact", formData.userContact);
      formDataObj.append("userContactInfo", formData.userContactInfo);
      formDataObj.append("status", formData.status);

      // Add date if it exists
      if (formData.lastSeenDate) {
        formDataObj.append(
          "lastSeen",
          new Date(formData.lastSeenDate).toISOString()
        );
      }

      // Add custom fields as JSON string
      const customFields = {
        age: formData.age,
        gender: formData.gender,
        size: formData.size,
        lastSeenLocation: formData.lastSeenLocation,
      };
      formDataObj.append("customFields", JSON.stringify(customFields));

      // Important: If we have existing images, pass them as a JSON string to preserve them
      if (formData.images && formData.images.length > 0) {
        // Set keepExistingPhotos to "true" to tell the backend to keep existing photos
        formDataObj.append("keepExistingPhotos", "true");

        // Also pass the existing photos array as a reference
        formDataObj.append("existingPhotos", JSON.stringify(formData.images));
      }

      // Use dogApi.updateDog which properly handles FormData
      await dogApi.updateDog(id, formDataObj);

      toast({
        title: "บันทึกข้อมูลเรียบร้อย",
        description: "ข้อมูลสุนัขถูกอัพเดทเรียบร้อยแล้ว",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate(`/dogs/${id}`);
    } catch (error) {
      console.error("Error updating dog:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลสุนัขได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Heading size="md">กำลังโหลดข้อมูล...</Heading>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Heading mb={6}>แก้ไขข้อมูลสุนัข</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>ชื่อสุนัข</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>พันธุ์</FormLabel>
            <Input
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>อายุ</FormLabel>
            <Input
              name="age"
              value={formData.age}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>เพศ</FormLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              placeholder="เลือกเพศ"
            >
              <option value="male">ผู้</option>
              <option value="female">เมีย</option>
              <option value="unknown">ไม่ทราบ</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>สี</FormLabel>
            <Input
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>ขนาด</FormLabel>
            <Select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="เลือกขนาด"
            >
              <option value="small">เล็ก</option>
              <option value="medium">กลาง</option>
              <option value="large">ใหญ่</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>รายละเอียด</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </FormControl>

          <Divider my={4} />

          <FormControl isRequired>
            <FormLabel>สถานที่</FormLabel>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>วันที่พบล่าสุด</FormLabel>
            <Input
              type="date"
              name="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>สถานที่พบล่าสุด</FormLabel>
            <Input
              name="lastSeenLocation"
              value={formData.lastSeenLocation}
              onChange={handleInputChange}
            />
          </FormControl>

          <Divider my={4} />

          <FormControl isRequired>
            <FormLabel>ข้อมูลการติดต่อ</FormLabel>
            <Input
              name="userContact"
              value={formData.userContact}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>รายละเอียดการติดต่อ</FormLabel>
            <Textarea
              name="userContactInfo"
              value={formData.userContactInfo}
              onChange={handleInputChange}
              rows={2}
            />
          </FormControl>

          <FormControl>
            <FormLabel>สถานะ</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">กำลังติดตาม</option>
              <option value="resolved">พบแล้ว</option>
              <option value="expired">ปิดการติดตาม</option>
            </Select>
          </FormControl>

          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            isLoading={submitting}
            loadingText="กำลังบันทึก..."
          >
            บันทึกข้อมูล
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default EditDogForm;
