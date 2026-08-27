"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import { applyDesignTokensToRoot } from "@/lib/design-system/tokens";
import { useTranslation } from "@/lib/i18n";

interface SettingsContextValue {
  settings: SiteSettings;
  ready: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  refreshSettings: async () => {},
});

export function useSiteSettings() {
  return useContext(SettingsContext);
}

/**
 * Client-side design system + settings provider.
 * Loads /api/settings once, applies the theme tokens to <html>, and exposes
 * the resolved settings to any client component that needs them (e.g. the
 * AI voice guide, the CV download button).
 */
export default function DesignSystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const { lang } = useTranslation();

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as SiteSettings;
      setSettings(data);
      applyDesignTokensToRoot(document.documentElement, data.design);
      // Apply "dark by default" only when the user never chose a theme.
      if (typeof localStorage !== "undefined" && !localStorage.getItem("theme")) {
        if (data.design.darkModeDefault) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  /* Re-apply dark tokens whenever the theme class changes. */
  useEffect(() => {
    const apply = () =>
      applyDesignTokensToRoot(document.documentElement, settings.design);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [settings.design, ready]);

  const banner = settings.banner.enabled && settings.banner.text[lang];

  return (
    <SettingsContext.Provider value={{ settings, ready, refreshSettings }}>
      {banner ? (
        <div className="border-b border-line bg-accent/10 px-4 py-2 text-center text-xs font-medium text-ink">
          {banner}
        </div>
      ) : null}
      {children}
    </SettingsContext.Provider>
  );
}
