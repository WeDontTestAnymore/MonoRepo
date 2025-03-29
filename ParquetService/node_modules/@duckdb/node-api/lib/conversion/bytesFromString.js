"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesFromString = bytesFromString;
const textEncoder = new TextEncoder();
function bytesFromString(str) {
    return textEncoder.encode(str);
}
