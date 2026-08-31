/**
 * Plan & BuildMetric Utility Formatters & Math Helpers (India Standards)
 * Pure deterministic algorithms with zero eval / zero unsafe code.
 */
import { formatCurrency, formatIndianNumber, formatLakhsCrores } from '../data/currencies.js';

export { formatCurrency, formatIndianNumber, formatLakhsCrores };

/**
 * Format a number with standard or Indian comma separation
 */
export function formatNumber(num, decimals = 0) {
  return formatIndianNumber(num, decimals);
}

/**
 * Format a percentage with standard sign
 */
export function formatPercent(num, decimals = 1) {
  if (isNaN(num) || num === null || num === undefined) return '0.0%';
  return `${Number(num).toFixed(decimals)}%`;
}

/**
 * Clamps a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Indian Construction Unit Conversions:
 * - 1 Brass = 100 Cubic Feet (cu.ft / CFT) = 2.83168 Cubic Meters (m³)
 * - 1 Cubic Meter (m³) = 35.3147 Cubic Feet (cu.ft / CFT) = 0.3531 Brass
 * - 1 Square Meter (m²) = 10.7639 Square Feet (sq.ft)
 * - 1 Tonne = 1000 kg = 10 Quintals
 * - 1 Standard Cement Bag = 50 kg = 0.0347 m³ = 1.226 cu.ft (Density ~1440 kg/m³)
 */

export function cuFtToBrass(cuFt) {
  return (Number(cuFt) || 0) / 100;
}

export function cuFtToCuM(cuFt) {
  return (Number(cuFt) || 0) * 0.0283168;
}

export function cuMToCuFt(cuM) {
  return (Number(cuM) || 0) * 35.3147;
}

export function sqFtToSqM(sqFt) {
  return (Number(sqFt) || 0) * 0.092903;
}

export function sqMToSqFt(sqM) {
  return (Number(sqM) || 0) * 10.7639;
}

/**
 * Copy text to clipboard with modern navigator.clipboard fallback
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Generate CSV formatted string from title and array of rows
 */
export function generateCSV(title, rows) {
  let csv = `"${title}"\n\n`;
  if (!rows || !rows.length) return csv;
  
  if (Array.isArray(rows[0])) {
    rows.forEach(row => {
      csv += row.map(cell => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
    });
  } else {
    const headers = Object.keys(rows[0]);
    csv += headers.map(h => `"${h}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
    });
  }
  return csv;
}

/**
 * Download generated CSV file to user's device
 */
export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Debounce utility for responsive high-frequency inputs
 */
export function debounce(func, wait = 100) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize and escape string to prevent DOM XSS vulnerabilities
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

