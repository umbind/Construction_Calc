/**
 * Plan & BuildMetric Currency Engine
 * Exclusively Indian Rupee (₹ INR) with Lakhs & Crores formatting
 */

export const currencies = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹ INR)',
    rate: 1.0,
    position: 'before',
    decimals: 0,
    separator: ','
  }
};

let activeCurrency = 'INR';

export function getActiveCurrency() {
  return activeCurrency;
}

export function getCurrencyCode() {
  return 'INR';
}

export function getCurrency() {
  return currencies.INR;
}

export function setActiveCurrency() {
  activeCurrency = 'INR';
}

export function setCurrency() {
  activeCurrency = 'INR';
}

export function initCurrency() {
  activeCurrency = 'INR';
}

/**
 * Format a number using Indian Numbering System (e.g. 12,34,567)
 */
export function formatIndianNumber(num, decimals = 0) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  const val = Number(num);
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  
  const fixed = absVal.toFixed(decimals);
  const parts = fixed.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return (isNegative ? '-' : '') + integerPart + decimalPart;
}

/**
 * Format amounts into Indian Lakhs (L) and Crores (Cr)
 * Example: 1,50,000 -> ₹1.50 Lakhs | 1,25,00,000 -> ₹1.25 Cr
 */
export function formatLakhsCrores(num, showSymbol = true) {
  if (isNaN(num) || num === null || num === undefined) return showSymbol ? '₹0' : '0';
  const val = Number(num);
  const sym = showSymbol ? '₹' : '';
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (absVal >= 10000000) {
    // 1 Crore = 10,000,000 (100 Lakhs)
    const cr = absVal / 10000000;
    return `${sign}${sym}${cr >= 100 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
  } else if (absVal >= 100000) {
    // 1 Lakh = 100,000
    const lk = absVal / 100000;
    return `${sign}${sym}${lk >= 100 ? lk.toFixed(1) : lk.toFixed(2)} Lakhs`;
  } else if (absVal >= 1000) {
    // Thousands
    const k = absVal / 1000;
    return `${sign}${sym}${k.toFixed(1)}k`;
  }
  
  return `${sign}${sym}${formatIndianNumber(absVal, 0)}`;
}

/**
 * Main currency formatter (₹ INR)
 */
export function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const val = Number(amount);
  const formatted = formatIndianNumber(val, 0);
  return `₹${formatted}`;
}
