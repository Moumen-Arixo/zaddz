import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "../config";

export interface AppSettings {
  copyrightYear: string;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
}

const defaultSettings: AppSettings = {
  copyrightYear: "2026",
  primaryColor: "#0ea5e9",
  secondaryColor: "#eab308",
  borderRadius: "12px"
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  resetSettings: async () => {}
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const applyColorsToDOM = (colors: { primary: string; secondary: string; radius: string }) => {
    // Add dynamically the colors as CSS variables in :root
    document.documentElement.style.setProperty("--color-primary-500", colors.primary);
    
    // Calculate contrast text color
    const getContrastYIQ = (hexcolor: string) => {
      hexcolor = hexcolor.replace("#", "");
      if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(x => x + x).join('');
      }
      var r = parseInt(hexcolor.substr(0,2),16);
      var g = parseInt(hexcolor.substr(2,2),16);
      var b = parseInt(hexcolor.substr(4,2),16);
      var yiq = ((r*299)+(g*587)+(b*114))/1000;
      return (yiq >= 128) ? 'black' : 'white';
    };

    const primaryText = getContrastYIQ(colors.primary);
    const accentText = getContrastYIQ(colors.secondary);

    // We can also create a style element to override Tailwind utilities
    let styleEl = document.getElementById("dynamic-theme-colors");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-theme-colors";
      document.head.appendChild(styleEl);
    }
    
    // Convert hex to rgb for rgba usage if needed, or simply let tailwind handle it if using tailwind 4 css variables
    styleEl.innerHTML = `
      :root {
        --color-primary-500: ${colors.primary};
        --color-primary-600: ${colors.primary};
        --color-primary-400: ${colors.primary};
        --color-accent-500: ${colors.secondary};
        --color-accent-600: ${colors.secondary};
        --color-accent-400: ${colors.secondary};
      }
      .bg-primary-400, .bg-primary-500, .bg-primary-600, .bg-primary-700 {
         color: ${primaryText} !important;
      }
      .bg-accent-400, .bg-accent-500, .bg-accent-600, .bg-accent-700 {
         color: ${accentText} !important;
      }
      .text-primary-400, .text-primary-500, .text-primary-600 {
         color: ${colors.primary} !important;
      }
      .text-accent-400, .text-accent-500, .text-accent-600 {
         color: ${colors.secondary} !important;
      }
      button, input, select, textarea, .btn {
        border-radius: ${colors.radius} !important;
      }
    `;
  };

  useEffect(() => {
    // Attempt local storage first for personal theme
    const localTheme = localStorage.getItem("user_theme_colors");
    let personalTheme: any = null;
    if (localTheme) {
      try {
        personalTheme = JSON.parse(localTheme);
      } catch(e) {}
    }

    fetchApi("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.copyrightYear) {
          // Merge DB settings with local theme overriding colors
          const merged = { 
            ...defaultSettings,
            ...data, 
            ...(personalTheme || {}) 
          };
          setSettings(merged);
          applyColorsToDOM({ primary: merged.primaryColor, secondary: merged.secondaryColor, radius: merged.borderRadius || "12px" });
        } else if (personalTheme) {
          const merged = { ...defaultSettings, ...personalTheme };
          setSettings(merged);
          applyColorsToDOM({ primary: merged.primaryColor, secondary: merged.secondaryColor, radius: merged.borderRadius || "12px" });
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        if (personalTheme) {
          const merged = { ...defaultSettings, ...personalTheme };
          setSettings(merged);
          applyColorsToDOM({ primary: merged.primaryColor, secondary: merged.secondaryColor, radius: merged.borderRadius || "12px" });
        }
      });
  }, []);

  const updateSettings = async (newValues: Partial<AppSettings>) => {
    const updated = { ...settings, ...newValues };
    setSettings(updated);
    applyColorsToDOM({ primary: updated.primaryColor, secondary: updated.secondaryColor, radius: updated.borderRadius || "12px" });
    localStorage.setItem("user_theme_colors", JSON.stringify({
      primaryColor: updated. primaryColor,
      secondaryColor: updated.secondaryColor,
      borderRadius: updated.borderRadius
    }));

    try {
      // Only update non-theme settings in DB if necessary
      const dbSettings = { copyrightYear: updated.copyrightYear };
      await fetchApi("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer admin_secret_token_123" },
        body: JSON.stringify(dbSettings)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    applyColorsToDOM({ primary: defaultSettings.primaryColor, secondary: defaultSettings.secondaryColor, radius: defaultSettings.borderRadius });
    localStorage.removeItem("user_theme_colors");
    
    try {
      await fetchApi("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer admin_secret_token_123" },
        body: JSON.stringify({ copyrightYear: defaultSettings.copyrightYear })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
