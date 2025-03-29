import { DuckDBValue } from './DuckDBValue';
export declare class DuckDBArrayValue {
    readonly items: readonly DuckDBValue[];
    constructor(items: readonly DuckDBValue[]);
    toString(): string;
}
export declare function arrayValue(items: readonly DuckDBValue[]): DuckDBArrayValue;
