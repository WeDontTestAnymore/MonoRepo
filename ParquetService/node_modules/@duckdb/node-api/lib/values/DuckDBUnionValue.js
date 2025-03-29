"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBUnionValue = void 0;
exports.unionValue = unionValue;
class DuckDBUnionValue {
    tag;
    value;
    constructor(tag, value) {
        this.tag = tag;
        this.value = value;
    }
    toString() {
        if (this.value == null) {
            return 'NULL';
        }
        return this.value.toString();
    }
}
exports.DuckDBUnionValue = DuckDBUnionValue;
function unionValue(tag, value) {
    return new DuckDBUnionValue(tag, value);
}
