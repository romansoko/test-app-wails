/**
 * Formats a number with commas as thousand separators and fixed decimal places
 * @param value The number to format
 * @param decimals The number of decimal places (default: 2)
 * @returns Formatted number string with commas (e.g., 322,781.00)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats a price with the currency symbol and thousand separators
 * @param price The price to format
 * @param currencySymbol The currency symbol (default: ₪)
 * @returns Formatted price string with currency symbol and commas (e.g., ₪322,781.00)
 */
export function formatPrice(price: number, currencySymbol: string = '₪'): string {
  return `${currencySymbol}${formatNumber(price)}`;
} 