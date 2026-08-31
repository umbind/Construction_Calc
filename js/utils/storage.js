/**
 * BuildMetric LocalStorage & History Manager
 * 100% Client-Side Private Storage
 */

const HISTORY_KEY = 'buildmetric_history';
const FAVORITES_KEY = 'buildmetric_favorites';
const THEME_KEY = 'buildmetric_theme';
const MAX_HISTORY_ITEMS = 50;

/**
 * Get calculation history with backward-compatible fallback
 */
export function getHistory() {
  try {
    let raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      // Legacy fallback
      raw = localStorage.getItem('constructcalc_history');
    }
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load history', e);
    return [];
  }
}

/**
 * Save a new calculation entry to history
 */
export function saveHistoryItem(item) {
  try {
    const history = getHistory();
    const newEntry = {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      toolId: item.toolId,
      toolTitle: item.toolTitle,
      summary: item.summary,
      inputs: item.inputs,
      results: item.results
    };
    
    // Unshift to put newest first
    history.unshift(newEntry);
    
    // Trim to max limit
    if (history.length > MAX_HISTORY_ITEMS) {
      history.length = MAX_HISTORY_ITEMS;
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newEntry;
  } catch (e) {
    console.warn('Failed to save history item', e);
    return null;
  }
}

/**
 * Delete single history item
 */
export function deleteHistoryItem(id) {
  try {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.warn('Failed to delete history item', e);
    return [];
  }
}

/**
 * Clear all history
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem('constructcalc_history');
  } catch (e) {
    console.warn('Failed to clear history', e);
  }
}

/**
 * Get pinned favorites array
 */
export function getFavorites() {
  try {
    let raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      raw = localStorage.getItem('constructcalc_favorites');
    }
    return raw ? JSON.parse(raw) : ['concrete', 'drywall', 'caprate', 'fixflip'];
  } catch (e) {
    return ['concrete', 'drywall', 'caprate', 'fixflip'];
  }
}

/**
 * Toggle favorite tool
 */
export function toggleFavorite(toolId) {
  try {
    let favs = getFavorites();
    if (favs.includes(toolId)) {
      favs = favs.filter(id => id !== toolId);
    } else {
      favs.push(toolId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return favs;
  } catch (e) {
    console.warn('Failed to toggle favorite', e);
    return [];
  }
}

/**
 * Check if tool is favorited
 */
export function isFavorite(toolId) {
  const favs = getFavorites();
  return favs.includes(toolId);
}

/**
 * Theme Management
 */
export function getTheme() {
  try {
    let saved = localStorage.getItem(THEME_KEY);
    if (!saved) {
      saved = localStorage.getItem('constructcalc_theme');
    }
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch (e) {
    return 'dark';
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch (e) {
    applyTheme(theme);
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
