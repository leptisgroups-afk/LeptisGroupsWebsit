/**
 * Dynamic configuration helper to resolve the backend API URL.
 * Automatically switches between the browser's hostname (for client requests on LAN)
 * and localhost (for server-side fetches or default local work).
 */
export const getBackendUrl = () => {
  // If we are in the browser (client-side), we use relative paths.
  // Next.js will proxy requests to the backend via rewrites configured in next.config.mjs.
  if (typeof window !== "undefined") {
    return "";
  }
  
  // Fallback for Server-Side Rendering (SSR) and build time.
  // Next.js server-side fetches will go directly to the local backend port.
  return process.env.BACKEND_URL || "http://127.0.0.1:8001";
};

export const getApiUrl = (path) => {
  const base = getBackendUrl();
  return `${base}${path}`;
};

/**
 * Ensures image and PDF URLs fetched from the backend use relative paths.
 * Next.js proxies these to the Django backend using next.config.mjs rewrites,
 * resolving images correctly in all environments (localhost, LAN, production AWS).
 */
export const getCleanImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  
  // If it's already a relative path, return it as-is
  if (url.startsWith("/media/")) {
    return url;
  }
  
  // If it contains /media/, extract the relative path starting from /media/
  const mediaIndex = url.indexOf("/media/");
  if (mediaIndex !== -1) {
    return url.substring(mediaIndex);
  }
  
  return url;
};

