import Dog, { IDog } from "../models/Dog";
import { deleteFiles } from "../utils/fileUtils";

interface CreateDogInput {
  type: "lost" | "found";
  name?: string;
  breed: string;
  color: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  locationName: string;
  description: string;
  photos?: string[];
  contact?: string;
  userId?: string;
  userContact?: string;
  lastSeen?: Date;
  foundDate?: Date;
  currentStatus?: "temporary" | "shelter";
}

interface UpdateDogInput extends Partial<CreateDogInput> {
  status?: "active" | "resolved" | "expired";
}

interface SearchParams {
  type?: "lost" | "found";
  status?: "active" | "resolved" | "expired";
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;
  };
  query?: string;
  userId?: string;
}

class DogService {
  async createDog(data: CreateDogInput): Promise<IDog> {
    const dog = new Dog(data);
    await dog.save();
    return dog;
  }

  async getDogs(params: SearchParams): Promise<IDog[]> {
    const query: any = {};

    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.userId) query.userId = params.userId;

    if (params.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [params.coordinates.lng, params.coordinates.lat],
          },
          $maxDistance: params.coordinates.radius,
        },
      };
    }

    return Dog.find(query).sort({ createdAt: -1 });
  }

  async getDogById(id: string): Promise<IDog | null> {
    const dog = await Dog.findById(id);

    if (dog && dog.userId) {
      try {
        const User = require("../models/User").default;
        const user = await User.findById(dog.userId);
        if (user && user.contactInfo) {
          dog.userContactInfo = user.contactInfo;
        }
      } catch (error) {
        console.error("Error fetching user contactInfo:", error);
        // Continue even if we can't get contactInfo
      }
    }

    return dog;
  }

  async updateDog(id: string, data: UpdateDogInput): Promise<IDog | null> {
    return Dog.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteDog(id: string): Promise<IDog | null> {
    const dog = await Dog.findById(id);
    if (!dog) return null;

    // Delete associated photos
    if (dog.photos && dog.photos.length > 0) {
      await deleteFiles(dog.photos);
    }

    return Dog.findByIdAndDelete(id);
  }

  async searchDogs(params: SearchParams): Promise<IDog[]> {
    const query: any = {};

    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.query) {
      query.$text = { $search: params.query };
    }

    return Dog.find(query)
      .sort(
        params.query ? { score: { $meta: "textScore" } } : { createdAt: -1 }
      )
      .limit(20);
  }

  async updateDogStatus(
    id: string,
    status: "active" | "resolved" | "expired"
  ): Promise<IDog | null> {
    return Dog.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }

  async getNearbyDogs(
    lat: number,
    lng: number,
    radius: number = 10000,
    type?: "lost" | "found"
  ): Promise<IDog[]> {
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
      status: "active",
    };

    if (type) query.type = type;

    return Dog.find(query).limit(50);
  }
}

export const dogService = new DogService();
export default dogService;
