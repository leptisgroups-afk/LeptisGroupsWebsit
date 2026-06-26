/**
 * Dynamic configuration helper to resolve the backend API URL.
 * Automatically switches between the browser's hostname (for client requests on LAN)
 * and localhost (for server-side fetches or default local work).
 */
export const getBackendUrl = () => {
  // Set your production backend URL here via environment variable.
  const PRODUCTION_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://leptisgroups.com";

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Check if the application is accessed locally, via local network (LAN), or directly via an IP address (e.g. AWS public IP)
    const isLocal = 
      hostname === "localhost" || 
      hostname === "127.0.0.1" || 
      hostname.startsWith("192.168.") || 
      hostname.startsWith("10.") || 
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (isLocal) {
      return `http://${hostname}:8001`;
    }
    return PRODUCTION_BACKEND_URL;
  }
  
  // Fallback for Server-Side Rendering (SSR)
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_BACKEND_URL;
  }
  return "http://127.0.0.1:8001";
};

export const getApiUrl = (path) => {
  const base = getBackendUrl();
  return `${base}${path}`;
};

/**
 * Ensures image and PDF URLs fetched from the backend use the correct LAN domain name/IP.
 * This fixes image/media rendering on external devices connected to the same network.
 */
export const getCleanImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  const backendUrl = getBackendUrl();
  
  // Handle relative media paths
  if (url.startsWith("/media/")) {
    return `${backendUrl}${url}`;
  }
  
  // Rewrite loopback/localhost references to the client's current LAN host on port 8001
  return url
    .replace("http://127.0.0.1:8001", backendUrl)
    .replace("http://localhost:8001", backendUrl);
};
