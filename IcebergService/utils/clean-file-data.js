export default function cleanFileData(rows) {
  if (!Array.isArray(rows)) return [];

  const seen = new Set();
  const uniqueRows = [];

  for (const row of rows) {
    if (!seen.has(row.file_path)) {
      seen.add(row.file_path);
      uniqueRows.push(row);
    }
  }

  return uniqueRows;
}
