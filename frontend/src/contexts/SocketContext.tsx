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
      // Use the proper socket URL - convert wss:// to https:// for Socket.IO client
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
      const baseUrl = socketUrl
        .replace("wss://", "https://")
        .replace("ws://", "http://");

      // Remove /api if present
      const cleanUrl = baseUrl.includes("/api")
        ? baseUrl.substring(0, baseUrl.indexOf("/api"))
        : baseUrl;

      console.log("Socket.IO connecting to:", cleanUrl);

      const socketInstance = io(cleanUrl, {
        autoConnect: false,
        auth: {
          token: user?.id,
        },
        path: "/socket.io/",
        transports: ["websocket", "polling"],
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
