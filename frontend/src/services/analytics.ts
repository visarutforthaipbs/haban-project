// Google Analytics service

// Define types for window gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Check if user has consented to analytics
const hasConsent = (): boolean => {
  if (typeof window !== "undefined") {
    const consent = localStorage.getItem("cookieConsent");
    return consent === "true";
  }
  return false;
};

// Initialize Google Analytics
export const initGA = (id: string): void => {
  if (typeof window !== "undefined" && hasConsent()) {
    // Add Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script1);

    // Add GA initialization code
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", id, {
      page_path: window.location.pathname,
    });

    // Add gtag to window
    window.gtag = gtag;
  }
};

// Track page views
export const trackPageView = (url: string): void => {
  if (typeof window !== "undefined" && window.gtag && hasConsent()) {
    window.gtag("config", import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_path: url,
    });
  }
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
): void => {
  if (typeof window !== "undefined" && window.gtag && hasConsent()) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user engagement
export const trackEngagement = (
  eventName: string,
  eventParams: Record<string, unknown>
): void => {
  if (typeof window !== "undefined" && window.gtag && hasConsent()) {
    window.gtag("event", eventName, eventParams);
  }
};
