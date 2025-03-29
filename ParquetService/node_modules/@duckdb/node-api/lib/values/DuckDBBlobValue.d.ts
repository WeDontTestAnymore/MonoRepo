export declare class DuckDBBlobValue {
    readonly bytes: Uint8Array;
    constructor(bytes: Uint8Array);
    /** Matches BLOB-to-VARCHAR conversion behavior of DuckDB. */
    toString(): string;
    static fromString(str: string): DuckDBBlobValue;
}
export declare function blobValue(input: Uint8Array | string): DuckDBBlobValue;
