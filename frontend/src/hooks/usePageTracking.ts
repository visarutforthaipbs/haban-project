import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../services/analytics";

/**
 * Custom hook to track page views with Google Analytics
 * Place this in your top-level component or router
 */
export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on location change
    trackPageView(location.pathname + location.search);
  }, [location]);
};
