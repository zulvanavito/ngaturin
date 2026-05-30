"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const ACCENT_COLORS = [
  { id: "wise-green", name: "Wise Green", hsl: "97 74% 67%", hex: "#9fe870" },
  { id: "ocean-blue", name: "Ocean Blue", hsl: "197 100% 61%", hex: "#38c8ff" },
  { id: "royal-purple", name: "Royal Purple", hsl: "260 100% 77%", hex: "#b18cff" },
  { id: "sunset-orange", name: "Sunset Orange", hsl: "25 100% 61%", hex: "#ff8c38" },
  { id: "emerald-deep", name: "Emerald Deep", hsl: "145 63% 49%", hex: "#2ecc71" },
  { id: "soft-charcoal", name: "Soft Charcoal", hsl: "120 2% 27%", hex: "#454745" },
];

interface UserPreferencesContextType {
  showDecimals: boolean;
  accentColor: string;
  updatePreferences: (prefs: Partial<{ showDecimals: boolean; accentColor: string }>) => Promise<void>;
  isLoading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [showDecimals, setShowDecimals] = useState(false);
  const [accentColor, setAccentColor] = useState("wise-green");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          // If not ok (e.g., 401 Unauthorized), don't try to parse as JSON if it might be HTML
          // However, we'll try to check content-type first
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
             await res.json(); // we can consume it but ignore
          }
          return;
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data) {
            if (data.show_decimals !== undefined) setShowDecimals(data.show_decimals);
            if (data.accent_color) setAccentColor(data.accent_color);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  // Effect to update CSS variables when accentColor changes
  useEffect(() => {
    const selected = ACCENT_COLORS.find((c) => c.id === accentColor) || ACCENT_COLORS[0];
    document.documentElement.style.setProperty("--primary", selected.hsl);
    
    // Also update primary-foreground for accessibility if needed
    // For now, most of our accents work well with dark green or black text
    if (accentColor === "soft-charcoal" || accentColor === "emerald-deep") {
      document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%"); // White text
    } else {
      document.documentElement.style.setProperty("--primary-foreground", "94 100% 10%"); // Dark green text
    }
  }, [accentColor]);

  const updatePreferences = async (newPrefs: Partial<{ showDecimals: boolean; accentColor: string }>) => {
    // Optimistic UI
    if (newPrefs.showDecimals !== undefined) setShowDecimals(newPrefs.showDecimals);
    if (newPrefs.accentColor !== undefined) setAccentColor(newPrefs.accentColor);

    // Map to snake_case for API
    const apiPayload: any = {};
    if (newPrefs.showDecimals !== undefined) apiPayload.show_decimals = newPrefs.showDecimals;
    if (newPrefs.accentColor !== undefined) apiPayload.accent_color = newPrefs.accentColor;

    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Revert if failed? Or just log.
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ showDecimals, accentColor, updatePreferences, isLoading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
