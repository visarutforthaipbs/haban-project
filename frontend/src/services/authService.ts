import api from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/api/auth/register",
      credentials
    );
    return response.data;
  },

  loginWithFacebook: async (accessToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/facebook", {
      accessToken,
    });
    return response.data;
  },

  loginWithFirebase: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/firebase", {
      idToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/api/auth/me");
    return response.data;
  },

  // Password reset functions
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post("/api/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post("/api/auth/reset-password", {
      token,
      newPassword,
    });
  },
};
