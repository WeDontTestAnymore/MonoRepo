import { DuckDBValue } from './DuckDBValue';
export declare class DuckDBStructValue {
    readonly entries: Readonly<Record<string, DuckDBValue>>;
    constructor(entries: Readonly<Record<string, DuckDBValue>>);
    toString(): string;
}
export declare function structValue(entries: Readonly<Record<string, DuckDBValue>>): DuckDBStructValue;
