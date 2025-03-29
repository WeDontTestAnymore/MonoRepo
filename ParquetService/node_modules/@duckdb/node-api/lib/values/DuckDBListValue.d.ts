import { DuckDBValue } from './DuckDBValue';
export declare class DuckDBListValue {
    readonly items: readonly DuckDBValue[];
    constructor(items: readonly DuckDBValue[]);
    toString(): string;
}
export declare function listValue(items: readonly DuckDBValue[]): DuckDBListValue;
