import { DogData } from "./api";

const generateMockDogs = (): DogData[] => {
  const mockDogs: DogData[] = [
    {
      _id: "1",
      type: "lost",
      name: "ลัคกี้",
      breed: "โกลเด้น รีทรีฟเวอร์",
      color: "สีทอง",
      location: {
        type: "Point",
        coordinates: [98.9853, 18.7883], // [lng, lat] - Near Nimman
      },
      locationName: "ถนนนิมมานเหมินทร์ ใกล้เมญ่า",
      description: "สุนัขพันธุ์โกลเด้นใส่ปลอกคอสีแดง หายบริเวณหน้าเมญ่า",
      photos: ["/mock/golden-retriever.jpg"],
      status: "active",
      lastSeen: new Date("2024-02-15T15:30:00"),
      contact: "0812345678",
    },
    {
      _id: "2",
      type: "found",
      breed: "บางแก้ว",
      color: "ขาว-น้ำตาล",
      location: {
        type: "Point",
        coordinates: [98.9719, 18.7953], // [lng, lat] - Near Old City
      },
      locationName: "บริเวณประตูท่าแพ",
      description: "พบสุนัขพันธุ์บางแก้วเร่ร่อนบริเวณประตูท่าแพ ใส่ปลอกคอสีฟ้า",
      photos: ["/mock/bangkaew.jpg"],
      status: "active",
      foundDate: new Date("2024-02-15T14:00:00"),
      currentStatus: "temporary",
      contact: "0823456789",
    },
    {
      _id: "3",
      type: "lost",
      name: "เป๊ปเปอร์",
      breed: "พุดเดิ้ล",
      color: "ดำ",
      location: {
        type: "Point",
        coordinates: [98.9933, 18.7968], // [lng, lat] - Near Central Festival
      },
      locationName: "เซ็นทรัลเฟสติวัล เชียงใหม่",
      description:
        "พุดเดิ้ลสีดำตัวเล็ก ใส่โบว์สีชมพู ตอบสนองต่อชื่อ 'เป๊ปเปอร์'",
      photos: ["/mock/poodle.jpg"],
      status: "active",
      lastSeen: new Date("2024-02-15T16:45:00"),
      contact: "0834567890",
    },
    {
      _id: "4",
      type: "found",
      breed: "พันธุ์ผสม",
      color: "น้ำตาล-ขาว",
      location: {
        type: "Point",
        coordinates: [98.9819, 18.8019], // [lng, lat] - Near Chang Phueak
      },
      locationName: "บริเวณประตูช้างเผือก",
      description: "พบสุนัขพันธุ์ผสมขนาดกลาง นิสัยเป็นมิตร เข้ากับคนง่าย",
      photos: ["/mock/mixed-breed.jpg"],
      status: "active",
      foundDate: new Date("2024-02-15T13:15:00"),
      currentStatus: "shelter",
      contact: "0845678901",
    },
    {
      _id: "5",
      type: "lost",
      name: "คุกกี้",
      breed: "ชิสุ",
      color: "ขาว-น้ำตาล",
      location: {
        type: "Point",
        coordinates: [98.9675, 18.7919], // [lng, lat] - Near Suthep
      },
      locationName: "ถนนสุเทพ ใกล้ มช.",
      description: "ชิสุขนาดเล็ก เพิ่งตัดขนมา ใส่สายจูงสีแดง",
      photos: ["/mock/shih-tzu.jpg"],
      status: "active",
      lastSeen: new Date("2024-02-15T17:30:00"),
      contact: "0856789012",
    },
    {
      _id: "6",
      type: "found",
      breed: "ไซบีเรียน ฮัสกี้",
      color: "เทา-ขาว",
      location: {
        type: "Point",
        coordinates: [98.9977, 18.7902], // [lng, lat] - Near Airport Plaza
      },
      locationName: "บริเวณแอร์พอร์ต พลาซ่า",
      description: "พบฮัสกี้เร่ร่อนใกล้แอร์พอร์ต พลาซ่า ตาสีฟ้า ขี้เล่น",
      photos: ["/mock/husky.jpg"],
      status: "active",
      foundDate: new Date("2024-02-15T12:00:00"),
      currentStatus: "temporary",
      contact: "0867890123",
    },
  ];

  return mockDogs;
};

export const mockDogApi = {
  getDogs: async (params?: {
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
  }) => {
    let dogs = generateMockDogs();

    if (params?.type) {
      dogs = dogs.filter((dog) => dog.type === params.type);
    }
    if (params?.status) {
      dogs = dogs.filter((dog) => dog.status === params.status);
    }

    return dogs;
  },

  getDog: async (id: string) => {
    const dogs = generateMockDogs();
    return dogs.find((dog) => dog._id === id) || null;
  },

  searchDogs: async (params: {
    q?: string;
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
  }) => {
    let dogs = generateMockDogs();

    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      dogs = dogs.filter(
        (dog) =>
          dog.breed.toLowerCase().includes(searchTerm) ||
          dog.description.toLowerCase().includes(searchTerm) ||
          dog.locationName.toLowerCase().includes(searchTerm) ||
          dog.name?.toLowerCase().includes(searchTerm)
      );
    }

    if (params.type) {
      dogs = dogs.filter((dog) => dog.type === params.type);
    }
    if (params.status) {
      dogs = dogs.filter((dog) => dog.status === params.status);
    }

    return dogs;
  },
};
