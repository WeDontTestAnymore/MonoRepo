"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBArrayValue = void 0;
exports.arrayValue = arrayValue;
const displayStringForDuckDBValue_1 = require("../conversion/displayStringForDuckDBValue");
class DuckDBArrayValue {
    items;
    constructor(items) {
        this.items = items;
    }
    toString() {
        return `[${this.items.map(displayStringForDuckDBValue_1.displayStringForDuckDBValue).join(', ')}]`;
    }
}
exports.DuckDBArrayValue = DuckDBArrayValue;
function arrayValue(items) {
    return new DuckDBArrayValue(items);
}
