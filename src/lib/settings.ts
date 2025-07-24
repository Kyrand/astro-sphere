export interface SiteSettings {
  viewMode: 'normal' | 'compact';
  frontPageArticleTextLimit: number;
  showHighlightsColumn: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  viewMode: 'normal',
  frontPageArticleTextLimit: 1000,
  showHighlightsColumn: true
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
          frontPageArticleTextLimit: settings.frontPageArticleTextLimit || 1000,
          showHighlightsColumn: settings.showHighlightsColumn !== undefined ? settings.showHighlightsColumn : true
        };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return {
      viewMode: 'normal',
      frontPageArticleTextLimit: 1000,
      showHighlightsColumn: true
    };
  }
`;