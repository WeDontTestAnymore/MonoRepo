"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBBlobValue = void 0;
exports.blobValue = blobValue;
const bytesFromString_1 = require("../conversion/bytesFromString");
const stringFromBlob_1 = require("../conversion/stringFromBlob");
class DuckDBBlobValue {
    bytes;
    constructor(bytes) {
        this.bytes = bytes;
    }
    /** Matches BLOB-to-VARCHAR conversion behavior of DuckDB. */
    toString() {
        return (0, stringFromBlob_1.stringFromBlob)(this.bytes);
    }
    static fromString(str) {
        return new DuckDBBlobValue(Buffer.from((0, bytesFromString_1.bytesFromString)(str)));
    }
}
exports.DuckDBBlobValue = DuckDBBlobValue;
function blobValue(input) {
    if (typeof input === 'string') {
        return DuckDBBlobValue.fromString(input);
    }
    return new DuckDBBlobValue(input);
}
