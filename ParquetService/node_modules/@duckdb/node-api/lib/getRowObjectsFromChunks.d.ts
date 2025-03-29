import { DuckDBDataChunk } from './DuckDBDataChunk';
import { DuckDBValue } from './values';
export declare function getRowObjectsFromChunks(chunks: readonly DuckDBDataChunk[], columnNames: readonly string[]): Record<string, DuckDBValue>[];
