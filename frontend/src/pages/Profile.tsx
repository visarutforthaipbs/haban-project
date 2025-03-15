import {
  Avatar,
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  List,
  ListItem,
  ListIcon,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiLogOut, FiCheck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { DogData, dogApi } from "../services/api";
import DogListViewWithUser from "../components/DogListViewWithUser";
import EditProfileModal from "../components/EditProfileModal";

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const [userDogs, setUserDogs] = useState<DogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUserDogs = async () => {
      if (!user) return;

      try {
        const response = await dogApi.getDogs({ userId: user.id });
        setUserDogs(response);
      } catch (error) {
        console.error("Error fetching user's dogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDogs();
  }, [user]);

  const lostDogs = userDogs.filter((dog) => dog.type === "lost");
  const foundDogs = userDogs.filter((dog) => dog.type === "found");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast({
        title: "ออกจากระบบไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const refreshUserData = async () => {
    if (!user) return;

    try {
      // Refresh user context data
      await refreshUser();

      // Refresh dog data
      const response = await dogApi.getDogs({ userId: user.id });
      setUserDogs(response);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <VStack spacing={4} align="center">
            <Avatar
              size="2xl"
              name={user.name}
              src={user.profileImage}
              bg="brand.500"
              color="white"
            />
            <VStack spacing={1}>
              <Heading size="lg">{user.name}</Heading>
              <Text color="gray.600">{user.email}</Text>
              {user.bio && (
                <Text
                  color="gray.600"
                  textAlign="center"
                  fontSize="sm"
                  maxW="90%"
                  mt={2}
                >
                  "{user.bio}"
                </Text>
              )}
              {user.preferredContact && (
                <Text color="gray.500" fontSize="xs" mt={1}>
                  ติดต่อผ่าน:{" "}
                  {user.preferredContact === "email"
                    ? "อีเมล"
                    : user.preferredContact === "phone"
                    ? "โทรศัพท์"
                    : user.preferredContact === "line"
                    ? "Line"
                    : user.preferredContact === "facebook"
                    ? "Facebook"
                    : user.preferredContact === "instagram"
                    ? "Instagram"
                    : user.preferredContact}
                  {user.contactInfo && ` - ${user.contactInfo}`}
                </Text>
              )}
              <Badge colorScheme="brand" fontSize="sm" mt={2}>
                สมาชิก
              </Badge>
            </VStack>
            <Box w="full" p={4} bg="neutral.50" borderRadius="md">
              <Heading size="sm" mb={3} color="brand.600">
                สิทธิประโยชน์ของสมาชิก
              </Heading>
              <List spacing={2}>
                <ListItem>
                  <ListIcon as={FiCheck} color="brand.500" />
                  รับการแจ้งเตือนเมื่อมีสุนัขที่ตรงกับที่คุณกำลังหา
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck} color="brand.500" />
                  บันทึกรายการที่สนใจไว้ดูภายหลัง
                </ListItem>
              </List>
            </Box>
            <HStack spacing={4} mt={4}>
              <Button
                leftIcon={<FiEdit />}
                variant="outline"
                colorScheme="brand"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
              >
                แก้ไขโปรไฟล์
              </Button>
              <Button
                leftIcon={<FiLogOut />}
                colorScheme="orange"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="lg" shadow="sm">
          <Tabs colorScheme="brand" isFitted>
            <TabList>
              <Tab>สุนัขที่แจ้งหาย</Tab>
              <Tab>สุนัขที่พบ</Tab>
              <Tab>รายการที่บันทึก</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {isLoading ? (
                  <Spinner />
                ) : lostDogs.length > 0 ? (
                  <DogListViewWithUser
                    dogs={lostDogs}
                    selectedDog={null}
                    onDogSelect={() => {}}
                    columns={{ base: 1, md: 2, lg: 2 }}
                  />
                ) : (
                  <Text color="gray.600" textAlign="center">
                    ยังไม่มีรายการสุนัขที่แจ้งหาย
                  </Text>
                )}
              </TabPanel>
              <TabPanel>
                {isLoading ? (
                  <Spinner />
                ) : foundDogs.length > 0 ? (
                  <DogListViewWithUser
                    dogs={foundDogs}
                    selectedDog={null}
                    onDogSelect={() => {}}
                    columns={{ base: 1, md: 2, lg: 2 }}
                  />
                ) : (
                  <Text color="gray.600" textAlign="center">
                    ยังไม่มีรายการสุนัขที่พบ
                  </Text>
                )}
              </TabPanel>
              <TabPanel>
                <Text color="gray.600" textAlign="center">
                  ยังไม่มีรายการที่บันทึก
                </Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdate={refreshUserData}
      />
    </Container>
  );
};

export default Profile;
