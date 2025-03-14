const Dog = require("../models/Dog");
const { deleteFiles } = require("../utils/fileUtils");

class DogService {
  async createDog(data) {
    const dog = new Dog(data);
    await dog.save();
    return dog;
  }

  async getDogs(params) {
    const query = {};

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

  async getDogById(id) {
    const dog = await Dog.findById(id);

    if (dog && dog.userId) {
      try {
        const User = require("../models/User");
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

  async updateDog(id, data) {
    return Dog.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteDog(id) {
    const dog = await Dog.findById(id);
    if (!dog) return null;

    // Delete associated photos
    if (dog.photos && dog.photos.length > 0) {
      await deleteFiles(dog.photos);
    }

    return Dog.findByIdAndDelete(id);
  }

  async searchDogs(params) {
    const query = {};

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

  async updateDogStatus(id, status) {
    return Dog.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }

  async getNearbyDogs(lat, lng, radius = 10000, type) {
    const query = {
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

const dogService = new DogService();
module.exports = { dogService, default: dogService };
