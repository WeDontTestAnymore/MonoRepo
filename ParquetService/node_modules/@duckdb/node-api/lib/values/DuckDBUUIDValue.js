"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBUUIDValue = void 0;
exports.uuidValue = uuidValue;
class DuckDBUUIDValue {
    hugeint;
    constructor(hugeint) {
        this.hugeint = hugeint;
    }
    /** Return the UUID as an unsigned 128-bit integer in a JS BigInt. */
    toUint128() {
        // UUID values are stored with their MSB flipped so their numeric ordering matches their string ordering.
        return (this.hugeint ^ 0x80000000000000000000000000000000n) & 0xffffffffffffffffffffffffffffffffn;
    }
    toString() {
        // Prepend with a (hex) 1 before converting to a hex string.
        // This ensures the trailing 32 characters are the hex digits we want, left padded with zeros as needed.
        const hex = (this.toUint128() | 0x100000000000000000000000000000000n).toString(16);
        return `${hex.substring(1, 9)}-${hex.substring(9, 13)}-${hex.substring(13, 17)}-${hex.substring(17, 21)}-${hex.substring(21, 33)}`;
    }
    /** Create a DuckDBUUIDValue from an unsigned 128-bit integer in a JS BigInt. */
    static fromUint128(uint128) {
        return new DuckDBUUIDValue((uint128 ^ 0x80000000000000000000000000000000n) & 0xffffffffffffffffffffffffffffffffn);
    }
    /**
     * Create a DuckDBUUIDValue from a HUGEINT as stored by DuckDB.
     *
     * UUID values are stored with their MSB flipped so their numeric ordering matches their string ordering.
     */
    static fromStoredHugeInt(hugeint) {
        return new DuckDBUUIDValue(hugeint);
    }
    static Max = new DuckDBUUIDValue(2n ** 127n - 1n); //  7fffffffffffffffffffffffffffffff
    static Min = new DuckDBUUIDValue(-(2n ** 127n)); //  80000000000000000000000000000000
}
exports.DuckDBUUIDValue = DuckDBUUIDValue;
/** Create a DuckDBUUIDValue from an unsigned 128-bit integer in a JS BigInt. */
function uuidValue(uint128) {
    return DuckDBUUIDValue.fromUint128(uint128);
}
