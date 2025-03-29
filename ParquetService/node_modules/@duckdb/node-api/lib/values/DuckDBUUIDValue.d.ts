export declare class DuckDBUUIDValue {
    readonly hugeint: bigint;
    private constructor();
    /** Return the UUID as an unsigned 128-bit integer in a JS BigInt. */
    toUint128(): bigint;
    toString(): string;
    /** Create a DuckDBUUIDValue from an unsigned 128-bit integer in a JS BigInt. */
    static fromUint128(uint128: bigint): DuckDBUUIDValue;
    /**
     * Create a DuckDBUUIDValue from a HUGEINT as stored by DuckDB.
     *
     * UUID values are stored with their MSB flipped so their numeric ordering matches their string ordering.
     */
    static fromStoredHugeInt(hugeint: bigint): DuckDBUUIDValue;
    static readonly Max: DuckDBUUIDValue;
    static readonly Min: DuckDBUUIDValue;
}
/** Create a DuckDBUUIDValue from an unsigned 128-bit integer in a JS BigInt. */
export declare function uuidValue(uint128: bigint): DuckDBUUIDValue;
