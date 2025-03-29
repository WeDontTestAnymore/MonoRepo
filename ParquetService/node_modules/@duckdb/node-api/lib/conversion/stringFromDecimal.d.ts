/**
 * Decimal string formatting.
 *
 * Supports a subset of the functionality of `BigInt.prototype.toLocaleString` for locale-specific formatting.
 */
export interface DuckDBDecimalFormatOptions {
    useGrouping?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}
export interface LocaleOptions {
    locales?: string | string[];
    options?: DuckDBDecimalFormatOptions;
}
/**
 * Convert a scaled decimal value to a string, possibly using locale-specific formatting.
 */
export declare function stringFromDecimal(scaledValue: bigint, scale: number, localeOptions?: LocaleOptions): string;
