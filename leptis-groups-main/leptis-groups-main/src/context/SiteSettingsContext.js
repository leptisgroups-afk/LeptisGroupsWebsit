"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "@/data/config";

const SiteSettingsContext = createContext({
  settings: null,
  loading: true,
  error: null,
  refreshSettings: async () => {},
});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(getApiUrl("/api/site-settings/"));
      setSettings(res.data);
      setError(null);
    } catch (err) {
      console.error("Error loading site settings:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
