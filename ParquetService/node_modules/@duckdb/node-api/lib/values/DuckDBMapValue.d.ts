import { DuckDBValue } from './DuckDBValue';
export interface DuckDBMapEntry {
    key: DuckDBValue;
    value: DuckDBValue;
}
export declare class DuckDBMapValue {
    readonly entries: DuckDBMapEntry[];
    constructor(entries: DuckDBMapEntry[]);
    toString(): string;
}
export declare function mapValue(entries: DuckDBMapEntry[]): DuckDBMapValue;
