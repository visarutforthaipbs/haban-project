import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export interface DogLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface DogData {
  _id: string;
  type: "lost" | "found";
  name?: string;
  breed: string;
  color: string;
  location: DogLocation;
  locationName: string;
  description: string;
  photos?: string[];
  status: "active" | "resolved" | "expired";
  contact?: string;
  userId?: string;
  userContact?: string;
  userContactInfo?: string;
  lastSeen?: Date;
  foundDate?: Date;
  currentStatus?: "temporary" | "shelter" | "on_location";
}

export interface CreateDogRequest extends Omit<DogData, "photos"> {
  photos?: FileList;
}

export interface DogApi {
  createDog: (data: FormData) => Promise<DogData>;
  getDogs: (params?: {
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
    lat?: number;
    lng?: number;
    radius?: number;
    userId?: string;
  }) => Promise<DogData[]>;
  getDog: (id: string) => Promise<DogData>;
  updateDog: (id: string, data: FormData) => Promise<DogData>;
  deleteDog: (id: string) => Promise<void>;
  searchDogs: (params: {
    q?: string;
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
  }) => Promise<DogData[]>;
  updateDogStatus: (id: string, status: string) => Promise<DogData>;
  saveDog: (id: string) => Promise<{ success: boolean }>;
  unsaveDog: (id: string) => Promise<{ success: boolean }>;
  getSavedDogs: () => Promise<DogData[]>;
}

export const dogApi: DogApi = {
  createDog: async (data: FormData) => {
    try {
      const response = await api.post<DogData>("/dogs", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return response.data;
    } catch (error: unknown) {
      console.error(
        "Error creating dog:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  getDogs: async (params?: {
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
    lat?: number;
    lng?: number;
    radius?: number;
    userId?: string;
  }) => {
    const response = await api.get<DogData[]>("/dogs", { params });
    return response.data;
  },

  getDog: async (id: string) => {
    const response = await api.get<DogData>(`/dogs/${id}`);
    return response.data;
  },

  updateDog: async (id: string, data: FormData) => {
    const response = await api.patch<DogData>(`/dogs/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteDog: async (id: string) => {
    await api.delete(`/dogs/${id}`);
  },

  searchDogs: async (params: {
    q?: string;
    type?: "lost" | "found";
    status?: "active" | "resolved" | "expired";
  }) => {
    const response = await api.get<DogData[]>("/dogs/search", { params });
    return response.data;
  },

  updateDogStatus: async (id: string, status: string) => {
    const response = await api.patch<DogData>(`/dogs/${id}/status`, {
      status,
    });
    return response.data;
  },

  saveDog: async (id: string) => {
    const response = await api.post<{ success: boolean }>(`/dogs/${id}/save`);
    return response.data;
  },

  unsaveDog: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/dogs/${id}/save`);
    return response.data;
  },

  getSavedDogs: async () => {
    try {
      // Check for token before making the request
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No authentication token found when fetching saved dogs");
        return [];
      }

      const response = await api.get<DogData[]>("/dogs/saved");
      return response.data;
    } catch (error) {
      console.error("Error fetching saved dogs:", error);
      // Return empty array instead of throwing error to prevent UI disruptions
      return [];
    }
  },
};

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export interface NotificationData {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "match" | "status_update" | "comment";
  read: boolean;
  data: {
    dogId?: string;
    commentId?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface NotificationApi {
  getNotifications(): Promise<NotificationData[]>;
  markAsRead(id: string): Promise<NotificationData>;
  markAllAsRead(): Promise<{ success: boolean }>;
  updateSettings(settings: {
    enableEmailNotifications: boolean;
    email?: string;
  }): Promise<{ success: boolean }>;
  getSettings(): Promise<{ enableEmailNotifications: boolean; email?: string }>;
}

export const notificationApi: NotificationApi = {
  async getNotifications() {
    const response = await api.get<NotificationData[]>("/notifications");
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.patch<NotificationData>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post<{ success: boolean }>(
      "/notifications/read-all"
    );
    return response.data;
  },

  async updateSettings(settings: {
    enableEmailNotifications: boolean;
    email?: string;
  }) {
    const response = await api.put<{ success: boolean }>(
      "/notifications/settings",
      settings
    );
    return response.data;
  },

  async getSettings() {
    const response = await api.get<{
      enableEmailNotifications: boolean;
      email?: string;
    }>("/notifications/settings");
    return response.data;
  },
};

export const updateDog = async (
  id: string,
  dogData: Partial<DogData>
): Promise<DogData> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Use PATCH instead of PUT to match the backend route
    // If the data contains files, we'd need to convert to FormData, but for this case
    // we're just updating text fields so we can use JSON
    const response = await api.patch<DogData>(`/dogs/${id}`, dogData);
    return response.data;
  } catch (error) {
    console.error("Error updating dog:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to update dog information"
      );
    }
    throw new Error("Failed to update dog information");
  }
};
