import { DuckDBValue } from './DuckDBValue';
export declare class DuckDBUnionValue {
    readonly tag: string;
    readonly value: DuckDBValue;
    constructor(tag: string, value: DuckDBValue);
    toString(): string;
}
export declare function unionValue(tag: string, value: DuckDBValue): DuckDBUnionValue;
