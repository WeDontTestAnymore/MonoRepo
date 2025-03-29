"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayStringForDuckDBValue = displayStringForDuckDBValue;
const sql_1 = require("../sql");
function displayStringForDuckDBValue(value) {
    if (value == null) {
        return 'NULL';
    }
    if (typeof value === 'string') {
        return (0, sql_1.quotedString)(value);
    }
    return value.toString();
}
