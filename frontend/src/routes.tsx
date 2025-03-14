import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Box, Spinner } from "@chakra-ui/react";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const Map = lazy(() => import("./pages/Map"));
const Profile = lazy(() => import("./pages/Profile"));
const PostLost = lazy(() => import("./pages/PostLost"));
const PostFound = lazy(() => import("./pages/PostFound"));
const DogDetails = lazy(() => import("./pages/DogDetails"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Layout = lazy(() => import("./components/Layout"));

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
    <Spinner size="xl" color="brand.500" />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Main app routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<Map />} />
          <Route path="profile" element={<Profile />} />
          <Route path="post-lost" element={<PostLost />} />
          <Route path="post-found" element={<PostFound />} />
          <Route path="dogs/:id" element={<DogDetails />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
