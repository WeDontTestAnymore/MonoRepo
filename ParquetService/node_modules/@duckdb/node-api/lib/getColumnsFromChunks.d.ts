import { DuckDBDataChunk } from './DuckDBDataChunk';
import { DuckDBValue } from './values';
export declare function getColumnsFromChunks(chunks: readonly DuckDBDataChunk[]): DuckDBValue[][];
