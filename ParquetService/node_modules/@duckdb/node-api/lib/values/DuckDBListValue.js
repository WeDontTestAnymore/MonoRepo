"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBListValue = void 0;
exports.listValue = listValue;
const displayStringForDuckDBValue_1 = require("../conversion/displayStringForDuckDBValue");
class DuckDBListValue {
    items;
    constructor(items) {
        this.items = items;
    }
    toString() {
        return `[${this.items.map(displayStringForDuckDBValue_1.displayStringForDuckDBValue).join(', ')}]`;
    }
}
exports.DuckDBListValue = DuckDBListValue;
function listValue(items) {
    return new DuckDBListValue(items);
}
