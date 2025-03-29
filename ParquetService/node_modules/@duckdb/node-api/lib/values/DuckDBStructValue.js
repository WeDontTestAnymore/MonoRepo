"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBStructValue = void 0;
exports.structValue = structValue;
const displayStringForDuckDBValue_1 = require("../conversion/displayStringForDuckDBValue");
class DuckDBStructValue {
    entries;
    constructor(entries) {
        this.entries = entries;
    }
    toString() {
        const parts = [];
        for (const name in this.entries) {
            parts.push(`${(0, displayStringForDuckDBValue_1.displayStringForDuckDBValue)(name)}: ${(0, displayStringForDuckDBValue_1.displayStringForDuckDBValue)(this.entries[name])}`);
        }
        return `{${parts.join(', ')}}`;
    }
}
exports.DuckDBStructValue = DuckDBStructValue;
function structValue(entries) {
    return new DuckDBStructValue(entries);
}
