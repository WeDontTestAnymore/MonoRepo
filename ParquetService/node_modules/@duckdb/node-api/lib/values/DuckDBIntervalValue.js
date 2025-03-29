"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBIntervalValue = void 0;
exports.intervalValue = intervalValue;
const dateTimeStringConversion_1 = require("../conversion/dateTimeStringConversion");
class DuckDBIntervalValue {
    months;
    days;
    micros;
    constructor(months, days, micros) {
        this.months = months;
        this.days = days;
        this.micros = micros;
    }
    toString() {
        return (0, dateTimeStringConversion_1.getDuckDBIntervalString)(this.months, this.days, this.micros);
    }
}
exports.DuckDBIntervalValue = DuckDBIntervalValue;
function intervalValue(months, days, micros) {
    return new DuckDBIntervalValue(months, days, micros);
}
