import { DuckDBDataChunk } from './DuckDBDataChunk';
import { DuckDBValue } from './values';
export declare function getRowsFromChunks(chunks: readonly DuckDBDataChunk[]): DuckDBValue[][];
