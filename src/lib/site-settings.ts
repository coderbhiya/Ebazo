'use client';

import { useEffect, useState } from 'react';
import { PublicSettings, fetchPublicSettings } from './api';

// Public settings (Admin > Settings / Homepage) shared by every storefront component —
// fetched once per page load instead of once per component.
let cached: Promise<PublicSettings> | null = null;

export function loadSiteSettings(): Promise<PublicSettings> {
  if (!cached) cached = fetchPublicSettings();
  return cached;
}

export function useSiteSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>({});
  useEffect(() => {
    let cancelled = false;
    loadSiteSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return settings;
}
