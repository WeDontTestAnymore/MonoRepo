"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBMapValue = void 0;
exports.mapValue = mapValue;
const displayStringForDuckDBValue_1 = require("../conversion/displayStringForDuckDBValue");
class DuckDBMapValue {
    entries;
    constructor(entries) {
        this.entries = entries;
    }
    toString() {
        return `{${this.entries.map(({ key, value }) => `${(0, displayStringForDuckDBValue_1.displayStringForDuckDBValue)(key)}: ${(0, displayStringForDuckDBValue_1.displayStringForDuckDBValue)(value)}`).join(', ')}}`;
    }
}
exports.DuckDBMapValue = DuckDBMapValue;
function mapValue(entries) {
    return new DuckDBMapValue(entries);
}
