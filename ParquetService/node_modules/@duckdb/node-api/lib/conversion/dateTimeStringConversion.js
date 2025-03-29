"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDuckDBDateStringFromYearMonthDay = getDuckDBDateStringFromYearMonthDay;
exports.getDuckDBDateStringFromDays = getDuckDBDateStringFromDays;
exports.getTimezoneOffsetString = getTimezoneOffsetString;
exports.getAbsoluteOffsetStringFromParts = getAbsoluteOffsetStringFromParts;
exports.getOffsetStringFromAbsoluteSeconds = getOffsetStringFromAbsoluteSeconds;
exports.getOffsetStringFromSeconds = getOffsetStringFromSeconds;
exports.getDuckDBTimeStringFromParts = getDuckDBTimeStringFromParts;
exports.getDuckDBTimeStringFromPartsNS = getDuckDBTimeStringFromPartsNS;
exports.getDuckDBTimeStringFromPositiveMicroseconds = getDuckDBTimeStringFromPositiveMicroseconds;
exports.getDuckDBTimeStringFromPositiveNanoseconds = getDuckDBTimeStringFromPositiveNanoseconds;
exports.getDuckDBTimeStringFromMicrosecondsInDay = getDuckDBTimeStringFromMicrosecondsInDay;
exports.getDuckDBTimeStringFromNanosecondsInDay = getDuckDBTimeStringFromNanosecondsInDay;
exports.getDuckDBTimeStringFromMicroseconds = getDuckDBTimeStringFromMicroseconds;
exports.getDuckDBTimestampStringFromDaysAndMicroseconds = getDuckDBTimestampStringFromDaysAndMicroseconds;
exports.getDuckDBTimestampStringFromDaysAndNanoseconds = getDuckDBTimestampStringFromDaysAndNanoseconds;
exports.getDuckDBTimestampStringFromMicroseconds = getDuckDBTimestampStringFromMicroseconds;
exports.getDuckDBTimestampStringFromSeconds = getDuckDBTimestampStringFromSeconds;
exports.getDuckDBTimestampStringFromMilliseconds = getDuckDBTimestampStringFromMilliseconds;
exports.getDuckDBTimestampStringFromNanoseconds = getDuckDBTimestampStringFromNanoseconds;
exports.getDuckDBIntervalString = getDuckDBIntervalString;
const DAYS_IN_400_YEARS = 146097; // (((365 * 4 + 1) * 25) - 1) * 4 + 1
const MILLISECONDS_PER_DAY_NUM = 86400000; // 1000 * 60 * 60 * 24
const MICROSECONDS_PER_SECOND = 1000000n;
const MICROSECONDS_PER_MILLISECOND = 1000n;
const NANOSECONDS_PER_SECOND = 1000000000n;
const SECONDS_PER_MINUTE = 60n;
const MINUTES_PER_HOUR = 60n;
const MICROSECONDS_PER_DAY = 86400000000n; // 24 * 60 * 60 * 1000000
const NANOSECONDS_PER_DAY = 86400000000000n; // 24 * 60 * 60 * 1000000000
const NEGATIVE_INFINITY_TIMESTAMP = -9223372036854775807n; // -(2^63-1)
const POSITIVE_INFINITY_TIMESTAMP = 9223372036854775807n; // 2^63-1
function getDuckDBDateStringFromYearMonthDay(year, month, dayOfMonth) {
    const yearStr = String(Math.abs(year)).padStart(4, '0');
    const monthStr = String(month).padStart(2, '0');
    const dayOfMonthStr = String(dayOfMonth).padStart(2, '0');
    return `${yearStr}-${monthStr}-${dayOfMonthStr}${year < 0 ? ' (BC)' : ''}`;
}
function getDuckDBDateStringFromDays(days) {
    const absDays = Math.abs(days);
    const sign = days < 0 ? -1 : 1;
    // 400 years is the shortest interval with a fixed number of days. (Leap years and different length months can result
    // in shorter intervals having different number of days.) By separating the number of 400 year intervals from the
    // interval covered by the remaining days, we can guarantee that the date resulting from shifting the epoch by the
    // remaining interval is within the valid range of the JS Date object. This allows us to use JS Date to calculate the
    // year, month, and day of month for the date represented by the remaining interval, thus accounting for leap years
    // and different length months. We can then safely add back the years from the 400 year intervals, because the month
    // and day of month won't change when a date is shifted by a whole number of such intervals.
    const num400YearIntervals = Math.floor(absDays / DAYS_IN_400_YEARS);
    const yearsFrom400YearIntervals = sign * num400YearIntervals * 400;
    const absDaysFromRemainingInterval = absDays % DAYS_IN_400_YEARS;
    const millisecondsFromRemainingInterval = sign * absDaysFromRemainingInterval * MILLISECONDS_PER_DAY_NUM;
    const date = new Date(millisecondsFromRemainingInterval);
    let year = yearsFrom400YearIntervals + date.getUTCFullYear();
    if (year < 0) {
        year--; // correct for non-existence of year zero
    }
    const month = date.getUTCMonth() + 1; // getUTCMonth returns zero-indexed month, but we want a one-index month for display
    const dayOfMonth = date.getUTCDate(); // getUTCDate returns one-indexed day-of-month
    return getDuckDBDateStringFromYearMonthDay(year, month, dayOfMonth);
}
function getTimezoneOffsetString(timezoneOffsetInMinutes) {
    if (timezoneOffsetInMinutes === undefined) {
        return undefined;
    }
    const negative = timezoneOffsetInMinutes < 0;
    const positiveMinutes = Math.abs(timezoneOffsetInMinutes);
    const minutesPart = positiveMinutes % 60;
    const hoursPart = Math.floor(positiveMinutes / 60);
    const minutesStr = minutesPart !== 0 ? String(minutesPart).padStart(2, '0') : '';
    const hoursStr = String(hoursPart).padStart(2, '0');
    return `${negative ? '-' : '+'}${hoursStr}${minutesStr ? `:${minutesStr}` : ''}`;
}
function getAbsoluteOffsetStringFromParts(hoursPart, minutesPart, secondsPart) {
    const hoursStr = String(hoursPart).padStart(2, '0');
    const minutesStr = minutesPart !== 0 || secondsPart !== 0
        ? String(minutesPart).padStart(2, '0')
        : '';
    const secondsStr = secondsPart !== 0 ? String(secondsPart).padStart(2, '0') : '';
    let result = hoursStr;
    if (minutesStr) {
        result += `:${minutesStr}`;
        if (secondsStr) {
            result += `:${secondsStr}`;
        }
    }
    return result;
}
function getOffsetStringFromAbsoluteSeconds(absoluteOffsetInSeconds) {
    const secondsPart = absoluteOffsetInSeconds % 60;
    const minutes = Math.floor(absoluteOffsetInSeconds / 60);
    const minutesPart = minutes % 60;
    const hoursPart = Math.floor(minutes / 60);
    return getAbsoluteOffsetStringFromParts(hoursPart, minutesPart, secondsPart);
}
function getOffsetStringFromSeconds(offsetInSeconds) {
    const negative = offsetInSeconds < 0;
    const absoluteOffsetInSeconds = negative ? -offsetInSeconds : offsetInSeconds;
    const absoluteString = getOffsetStringFromAbsoluteSeconds(absoluteOffsetInSeconds);
    return `${negative ? '-' : '+'}${absoluteString}`;
}
function getDuckDBTimeStringFromParts(hoursPart, minutesPart, secondsPart, microsecondsPart) {
    const hoursStr = String(hoursPart).padStart(2, '0');
    const minutesStr = String(minutesPart).padStart(2, '0');
    const secondsStr = String(secondsPart).padStart(2, '0');
    const microsecondsStr = String(microsecondsPart)
        .padStart(6, '0')
        .replace(/0+$/, '');
    return `${hoursStr}:${minutesStr}:${secondsStr}${microsecondsStr.length > 0 ? `.${microsecondsStr}` : ''}`;
}
function getDuckDBTimeStringFromPartsNS(hoursPart, minutesPart, secondsPart, nanosecondsPart) {
    const hoursStr = String(hoursPart).padStart(2, '0');
    const minutesStr = String(minutesPart).padStart(2, '0');
    const secondsStr = String(secondsPart).padStart(2, '0');
    const nanosecondsStr = String(nanosecondsPart)
        .padStart(9, '0')
        .replace(/0+$/, '');
    return `${hoursStr}:${minutesStr}:${secondsStr}${nanosecondsStr.length > 0 ? `.${nanosecondsStr}` : ''}`;
}
function getDuckDBTimeStringFromPositiveMicroseconds(positiveMicroseconds) {
    const microsecondsPart = positiveMicroseconds % MICROSECONDS_PER_SECOND;
    const seconds = positiveMicroseconds / MICROSECONDS_PER_SECOND;
    const secondsPart = seconds % SECONDS_PER_MINUTE;
    const minutes = seconds / SECONDS_PER_MINUTE;
    const minutesPart = minutes % MINUTES_PER_HOUR;
    const hoursPart = minutes / MINUTES_PER_HOUR;
    return getDuckDBTimeStringFromParts(hoursPart, minutesPart, secondsPart, microsecondsPart);
}
function getDuckDBTimeStringFromPositiveNanoseconds(positiveNanoseconds) {
    const nanosecondsPart = positiveNanoseconds % NANOSECONDS_PER_SECOND;
    const seconds = positiveNanoseconds / NANOSECONDS_PER_SECOND;
    const secondsPart = seconds % SECONDS_PER_MINUTE;
    const minutes = seconds / SECONDS_PER_MINUTE;
    const minutesPart = minutes % MINUTES_PER_HOUR;
    const hoursPart = minutes / MINUTES_PER_HOUR;
    return getDuckDBTimeStringFromPartsNS(hoursPart, minutesPart, secondsPart, nanosecondsPart);
}
function getDuckDBTimeStringFromMicrosecondsInDay(microsecondsInDay) {
    const positiveMicroseconds = microsecondsInDay < 0
        ? microsecondsInDay + MICROSECONDS_PER_DAY
        : microsecondsInDay;
    return getDuckDBTimeStringFromPositiveMicroseconds(positiveMicroseconds);
}
function getDuckDBTimeStringFromNanosecondsInDay(nanosecondsInDay) {
    const positiveNanoseconds = nanosecondsInDay < 0
        ? nanosecondsInDay + NANOSECONDS_PER_DAY
        : nanosecondsInDay;
    return getDuckDBTimeStringFromPositiveNanoseconds(positiveNanoseconds);
}
function getDuckDBTimeStringFromMicroseconds(microseconds) {
    const negative = microseconds < 0;
    const positiveMicroseconds = negative ? -microseconds : microseconds;
    const positiveString = getDuckDBTimeStringFromPositiveMicroseconds(positiveMicroseconds);
    return negative ? `-${positiveString}` : positiveString;
}
function getDuckDBTimestampStringFromDaysAndMicroseconds(days, microsecondsInDay, timezonePart) {
    // This conversion of BigInt to Number is safe, because the largest absolute value that `days` can has is 106751991,
    // which fits without loss of precision in a JS Number. (106751991 = (2^63-1) / MICROSECONDS_PER_DAY)
    const dateStr = getDuckDBDateStringFromDays(Number(days));
    const timeStr = getDuckDBTimeStringFromMicrosecondsInDay(microsecondsInDay);
    return `${dateStr} ${timeStr}${timezonePart ?? ''}`;
}
function getDuckDBTimestampStringFromDaysAndNanoseconds(days, nanosecondsInDay) {
    // This conversion of BigInt to Number is safe, because the largest absolute value that `days` can has is 106751
    // which fits without loss of precision in a JS Number. (106751 = (2^63-1) / NANOSECONDS_PER_DAY)
    const dateStr = getDuckDBDateStringFromDays(Number(days));
    const timeStr = getDuckDBTimeStringFromNanosecondsInDay(nanosecondsInDay);
    return `${dateStr} ${timeStr}`;
}
function getDuckDBTimestampStringFromMicroseconds(microseconds, timezoneOffsetInMinutes) {
    // Note that -infinity and infinity are only representable in TIMESTAMP (and TIMESTAMPTZ), not the other timestamp
    // variants. This is by-design and matches DuckDB.
    if (microseconds === NEGATIVE_INFINITY_TIMESTAMP) {
        return '-infinity';
    }
    if (microseconds === POSITIVE_INFINITY_TIMESTAMP) {
        return 'infinity';
    }
    const offsetMicroseconds = timezoneOffsetInMinutes !== undefined
        ? microseconds +
            BigInt(timezoneOffsetInMinutes) *
                MICROSECONDS_PER_SECOND *
                SECONDS_PER_MINUTE
        : microseconds;
    let days = offsetMicroseconds / MICROSECONDS_PER_DAY;
    let microsecondsPart = offsetMicroseconds % MICROSECONDS_PER_DAY;
    if (microsecondsPart < 0) {
        days--;
        microsecondsPart += MICROSECONDS_PER_DAY;
    }
    return getDuckDBTimestampStringFromDaysAndMicroseconds(days, microsecondsPart, getTimezoneOffsetString(timezoneOffsetInMinutes));
}
function getDuckDBTimestampStringFromSeconds(seconds) {
    return getDuckDBTimestampStringFromMicroseconds(seconds * MICROSECONDS_PER_SECOND);
}
function getDuckDBTimestampStringFromMilliseconds(milliseconds) {
    return getDuckDBTimestampStringFromMicroseconds(milliseconds * MICROSECONDS_PER_MILLISECOND);
}
function getDuckDBTimestampStringFromNanoseconds(nanoseconds) {
    let days = nanoseconds / NANOSECONDS_PER_DAY;
    let nanosecondsPart = nanoseconds % NANOSECONDS_PER_DAY;
    if (nanosecondsPart < 0) {
        days--;
        nanosecondsPart += NANOSECONDS_PER_DAY;
    }
    return getDuckDBTimestampStringFromDaysAndNanoseconds(days, nanosecondsPart);
}
// Assumes baseUnit can be pluralized by adding an 's'.
function numberAndUnit(value, baseUnit) {
    return `${value} ${baseUnit}${Math.abs(value) !== 1 ? 's' : ''}`;
}
function getDuckDBIntervalString(months, days, microseconds) {
    const parts = [];
    if (months !== 0) {
        const sign = months < 0 ? -1 : 1;
        const absMonths = Math.abs(months);
        const absYears = Math.floor(absMonths / 12);
        const years = sign * absYears;
        const extraMonths = sign * (absMonths - absYears * 12);
        if (years !== 0) {
            parts.push(numberAndUnit(years, 'year'));
        }
        if (extraMonths !== 0) {
            parts.push(numberAndUnit(extraMonths, 'month'));
        }
    }
    if (days !== 0) {
        parts.push(numberAndUnit(days, 'day'));
    }
    if (microseconds !== 0n) {
        parts.push(getDuckDBTimeStringFromMicroseconds(microseconds));
    }
    if (parts.length > 0) {
        return parts.join(' ');
    }
    return '00:00:00';
}
