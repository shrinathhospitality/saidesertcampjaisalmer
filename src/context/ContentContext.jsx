import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFallbackContent, loadPublicContent } from '../services/contentService.js';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  // Render instantly with the bundled fallback so the site is never blank,
  // then swap in live CMS data as soon as it arrives.
  const [content, setContent] = useState(getFallbackContent);

  useEffect(() => {
    let active = true;
    loadPublicContent().then((data) => {
      if (active) setContent(data);
    }).catch(() => {
      // Network failure: keep showing the bundled fallback already in state.
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    ...content,
    /** Looks up a page's CMS record (hero/SEO overrides) by its route path. */
    getPage: (path) => content.pages.find((p) => p.path === path) || null,
  }), [content]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
