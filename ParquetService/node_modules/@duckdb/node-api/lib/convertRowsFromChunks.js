"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRowsFromChunks = convertRowsFromChunks;
function convertRowsFromChunks(chunks, converter) {
    const rows = [];
    for (const chunk of chunks) {
        const rowCount = chunk.rowCount;
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            rows.push(chunk.convertRowValues(rowIndex, converter));
        }
    }
    return rows;
}
