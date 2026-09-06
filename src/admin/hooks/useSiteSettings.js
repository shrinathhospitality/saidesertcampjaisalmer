import { useEffect, useState } from 'react';
import { contentApi } from '../services/content.js';
import fallbackSettings from '../../data/settings.json';

/** Live site settings from the API, falling back to the bundled JSON copy if the API is unreachable. */
export function useSiteSettings() {
  const [settings, setSettings] = useState(fallbackSettings);

  useEffect(() => {
    let active = true;
    contentApi.list('site-settings').then((data) => {
      if (active && data) setSettings((prev) => ({ ...prev, ...data }));
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
