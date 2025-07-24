export interface SiteSettings {
  viewMode: 'normal' | 'compact';
  frontPageArticleTextLimit: number;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  viewMode: 'normal',
  frontPageArticleTextLimit: 1000
};

/**
 * Get site settings from localStorage or return defaults
 */
export function getSiteSettings(): SiteSettings {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        const settings = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...settings
        };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }
  return DEFAULT_SETTINGS;
}

/**
 * Client-side script to inject settings into window
 */
export const settingsScript = `
  window.getSiteSettings = function() {
    try {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        const settings = JSON.parse(stored);
        return {
          viewMode: settings.viewMode || 'normal',
          frontPageArticleTextLimit: settings.frontPageArticleTextLimit || 1000
        };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return {
      viewMode: 'normal',
      frontPageArticleTextLimit: 1000
    };
  }
`;