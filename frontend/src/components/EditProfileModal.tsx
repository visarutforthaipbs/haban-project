import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  Avatar,
  Text,
  Box,
  FormErrorMessage,
  Textarea,
  Center,
  Icon,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  FiUpload,
  FiUser,
  FiPhone,
  FiMessageCircle,
  FiMail,
} from "react-icons/fi";
import api from "../services/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  onUpdate,
}: EditProfileModalProps) => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [preferredContact, setPreferredContact] = useState(
    user?.preferredContact || ""
  );
  const [contactInfo, setContactInfo] = useState(user?.contactInfo || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    user?.profileImage
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form values when user changes or modal reopens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setPreferredContact(user.preferredContact || "");
      setContactInfo(user.contactInfo || "");
      setPreviewUrl(user.profileImage);
      setError("");
    }
  }, [isOpen, user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ไฟล์มีขนาดใหญ่เกินไป",
          description: "กรุณาอัปโหลดรูปภาพที่มีขนาดไม่เกิน 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("ชื่อไม่สามารถเป็นค่าว่างได้");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("name", name);

      if (bio !== undefined) {
        formData.append("bio", bio);
      }

      if (preferredContact !== undefined) {
        formData.append("preferredContact", preferredContact);
      }

      if (contactInfo !== undefined) {
        formData.append("contactInfo", contactInfo);
      }

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // Make an API call to update the user profile using the configured axios instance
      await api.patch("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh the user data in the AuthContext
      await refreshUser();

      // Show success message
      toast({
        title: "อัพเดทโปรไฟล์สำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Trigger update in parent component
      onUpdate();

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("ไม่สามารถอัพเดทโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");

      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get placeholder text based on selected preferred contact method
  const getContactPlaceholder = () => {
    switch (preferredContact) {
      case "email":
        return "อีเมลของคุณ";
      case "phone":
        return "เบอร์โทรศัพท์ของคุณ";
      case "line":
        return "ID Line ของคุณ";
      case "facebook":
        return "ชื่อผู้ใช้หรือลิงก์ Facebook ของคุณ";
      case "instagram":
        return "ชื่อผู้ใช้ Instagram ของคุณ";
      default:
        return "ข้อมูลการติดต่อของคุณ";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>แก้ไขโปรไฟล์</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6}>
            {/* Profile Image Upload */}
            <Center position="relative" width="100%">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
              <Box
                position="relative"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                textAlign="center"
              >
                <Avatar
                  size="xl"
                  name={user?.name}
                  src={previewUrl}
                  bg="brand.500"
                  color="white"
                  mb={2}
                />
                <Box
                  position="absolute"
                  bottom="8px"
                  right="0"
                  bg="brand.500"
                  borderRadius="full"
                  p={1}
                  color="white"
                >
                  <Icon as={FiUpload} boxSize={4} />
                </Box>
                <Text fontSize="sm" color="brand.600" mt={1}>
                  อัปโหลดรูปโปรไฟล์
                </Text>
              </Box>
            </Center>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              {user?.email}
            </Text>

            {/* Name Input */}
            <FormControl isInvalid={!!error} isRequired>
              <FormLabel>ชื่อ</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiUser} color="gray.500" />
                </InputLeftElement>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                />
              </InputGroup>
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            {/* Bio Input */}
            <FormControl>
              <FormLabel>คำอธิบายสั้นๆ เกี่ยวกับตัวคุณ</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiMessageCircle} color="gray.500" />
                </InputLeftElement>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="เขียนเกี่ยวกับตัวคุณสั้นๆ (ไม่เกิน 500 ตัวอักษร)"
                  maxLength={500}
                  paddingLeft="40px"
                  resize="vertical"
                />
              </InputGroup>
            </FormControl>

            {/* Preferred Contact Input */}
            <FormControl>
              <FormLabel>ช่องทางการติดต่อที่ต้องการ</FormLabel>
              <Select
                placeholder="เลือกช่องทางที่ต้องการให้ติดต่อ"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                icon={<Icon as={FiPhone} />}
              >
                <option value="email">อีเมล</option>
                <option value="phone">โทรศัพท์</option>
                <option value="line">Line</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </Select>
            </FormControl>

            {/* Contact Information Input - New Field */}
            {preferredContact && (
              <FormControl>
                <FormLabel>ข้อมูลการติดต่อ</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiMail} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder={getContactPlaceholder()}
                  />
                </InputGroup>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            บันทึก
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
