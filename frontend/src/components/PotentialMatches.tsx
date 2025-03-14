import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Heading,
  Image,
} from "@chakra-ui/react";
import { DogData } from "../services/api";
import { findPotentialMatches } from "../utils/matchingSystem";
import { useEffect, useState } from "react";

interface PotentialMatchesProps {
  selectedDog: DogData;
  allDogs: DogData[];
  onMatchSelect: (dog: DogData) => void;
}

const ScoreIndicator = ({ label, score }: { label: string; score: number }) => (
  <VStack align="stretch" spacing={1}>
    <HStack justify="space-between">
      <Text fontSize="sm" color="gray.600">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="bold">
        {Math.round(score * 100)}%
      </Text>
    </HStack>
    <Progress
      value={score * 100}
      size="sm"
      colorScheme={score > 0.7 ? "green" : score > 0.4 ? "yellow" : "red"}
      borderRadius="full"
    />
  </VStack>
);

export const PotentialMatches = ({
  selectedDog,
  allDogs,
  onMatchSelect,
}: PotentialMatchesProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [matches, setMatches] = useState<
    Array<{ dog: DogData; matchScore: { score: number; details: any } }>
  >([]);

  useEffect(() => {
    if (selectedDog) {
      const potentialMatches = findPotentialMatches(selectedDog, allDogs);
      setMatches(potentialMatches);
    }
  }, [selectedDog, allDogs]);

  if (!selectedDog || matches.length === 0) return null;

  return (
    <>
      <Button
        position="fixed"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        colorScheme="brand"
        size="lg"
        onClick={onOpen}
        zIndex={1000}
        leftIcon={
          <Badge
            colorScheme="red"
            borderRadius="full"
            fontSize="sm"
            transform="translateY(-1px)"
          >
            {matches.length}
          </Badge>
        }
      >
        พบสุนัขที่อาจจะตรงกัน
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            สุนัขที่อาจจะตรงกับ{" "}
            {selectedDog.type === "lost" ? "สุนัขหาย" : "สุนัขที่พบ"}:{" "}
            {selectedDog.name || selectedDog.breed}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {matches.map(({ dog, matchScore }) => (
                <Box
                  key={dog._id}
                  borderWidth={1}
                  borderRadius="lg"
                  overflow="hidden"
                  bg="white"
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => {
                    onMatchSelect(dog);
                    onClose();
                  }}
                  _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                >
                  <HStack spacing={4} p={4}>
                    <Image
                      src={dog.photos?.[0] || "/dog-placeholder.png"}
                      alt={dog.breed}
                      boxSize="120px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="stretch" flex={1}>
                      <HStack justify="space-between">
                        <Heading size="md">
                          {dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"}:{" "}
                          {dog.name || dog.breed}
                        </Heading>
                        <Badge
                          colorScheme={
                            matchScore.score > 0.8
                              ? "green"
                              : matchScore.score > 0.6
                              ? "yellow"
                              : "red"
                          }
                          fontSize="lg"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {Math.round(matchScore.score * 100)}% ตรงกัน
                        </Badge>
                      </HStack>
                      <Text color="gray.600" noOfLines={2}>
                        {dog.description}
                      </Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <ScoreIndicator
                          label="พันธุ์"
                          score={matchScore.details.breedScore}
                        />
                        <ScoreIndicator
                          label="สี"
                          score={matchScore.details.colorScore}
                        />
                        <ScoreIndicator
                          label="ระยะทาง"
                          score={matchScore.details.locationScore}
                        />
                        <ScoreIndicator
                          label="เวลา"
                          score={matchScore.details.timeScore}
                        />
                      </SimpleGrid>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
