import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import theme from "./theme";
import AppRoutes from "./routes";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import EditDogForm from "./pages/EditDogForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <SocketProvider>
                <AppRoutes />
              </SocketProvider>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
