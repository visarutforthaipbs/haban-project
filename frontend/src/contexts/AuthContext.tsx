import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@chakra-ui/react";
import { User, LoginCredentials, RegisterCredentials } from "../types/auth";
import { authApi } from "../services/authService";
import {
  signInWithGoogle,
  signInWithFacebook,
  signOutFirebase,
  onAuthStateChange,
} from "../services/firebase";
import { User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Type for Facebook SDK
interface FacebookSDK {
  init(params: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  logout(): void;
}

declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Handle Firebase user authentication with backend
  const handleFirebaseAuth = async (firebaseUser: FirebaseUser) => {
    try {
      setIsLoading(true);

      // Get the ID token from Firebase
      const idToken = await firebaseUser.getIdToken();

      // Send the token to your backend to create/get user
      const response = await authApi.loginWithFirebase(idToken);

      // Set user state and token
      localStorage.setItem("token", response.token);
      setUser(response.user);

      // Check if this is a new user or returning user
      if (response.isNewUser) {
        toast({
          title: "ลงทะเบียนสำเร็จ",
          description: `ยินดีต้อนรับคุณ ${response.user.name} เข้าสู่หาบ้าน.com`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: `ยินดีต้อนรับกลับมา ${response.user.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Firebase auth error:", error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        await handleFirebaseAuth(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize Facebook SDK for legacy support
  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/th_TH/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      };
    };

    loadFacebookSDK();
  }, []);

  // Initialize auth for direct API token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { user } = await authApi.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error("Failed to get current user:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // New method for Firebase Facebook login
  const loginWithFacebook = async () => {
    try {
      setIsLoading(true);
      await signInWithFacebook();
      // Firebase auth state change will handle the rest
    } catch (error) {
      console.error("Facebook login failed:", error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New method for Google login
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Firebase auth state change will handle the rest
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem("token", token);
      setUser(user);
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const { user, token } = await authApi.register(credentials);
      localStorage.setItem("token", token);
      setUser(user);
      toast({
        title: "ลงทะเบียนสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "ลงทะเบียนไม่สำเร็จ",
        description: "กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      localStorage.removeItem("token");
      setUser(null);

      // Log out from Firebase Auth
      await signOutFirebase();

      // Also logout from Facebook if user was logged in with Facebook
      if (window.FB) {
        window.FB.logout();
      }

      toast({
        title: "ออกจากระบบสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "ออกจากระบบไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authApi.requestPasswordReset(email);
      toast({
        title: "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว",
        description: "กรุณาตรวจสอบอีเมลของคุณ",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast({
        title: "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่าน",
        description: "กรุณาลองใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authApi.resetPassword(token, newPassword);
      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Password reset failed:", error);
      toast({
        title: "รีเซ็ตรหัสผ่านไม่สำเร็จ",
        description: "โทเค็นอาจหมดอายุหรือไม่ถูกต้อง",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { user } = await authApi.getCurrentUser();
        setUser(user);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithFacebook,
        loginWithGoogle,
        requestPasswordReset,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
