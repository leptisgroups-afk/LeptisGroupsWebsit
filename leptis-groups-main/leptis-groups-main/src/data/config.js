/**
 * Dynamic configuration helper to resolve the backend API URL.
 * Automatically switches between the browser's hostname (for client requests on LAN)
 * and localhost (for server-side fetches or default local work).
 */
export const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    // If the browser accessed via LAN IP (e.g. 192.168.1.211:3000), 
    // the backend requests will target the same LAN host on port 8001 (192.168.1.211:8001).
    return `http://${window.location.hostname}:8001`;
  }
  // Fallback for SSR/SSG running on the host machine
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
  if (!url) return url;
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
