import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get the base URL without the '/api' path
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.includes("/api")
        ? apiUrl.substring(0, apiUrl.indexOf("/api"))
        : apiUrl;

      const socketInstance = io(baseUrl, {
        autoConnect: false,
        auth: {
          token: user?.id,
        },
        path: "/socket.io/",
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setIsConnected(false);
      });

      socketInstance.auth = { token: user.id };
      socketInstance.connect();

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
