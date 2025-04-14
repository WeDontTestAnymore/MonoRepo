import { useState, useEffect } from "react";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ParquetInfoProps {
  selectedTable: string;
}

const ParquetInfo = ({ selectedTable }: ParquetInfoProps) => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<any[]>([]);
  const [rowGroups, setRowGroups] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [columnStats, setColumnStats] = useState<any[]>([]);

  const tableCred = useSelector(
    (state: RootState) => state.tableCred.tableCred
  );

  const fetchParquetInfo = async () => {
    setLoading(true);
    try {
      const table = tableCred?.find((table) =>
        table.path.includes(selectedTable)
      );
      if (!table) {
        toast.error("Table not found.");
        return;
      }

      const parquetPath = `${selectedTable}`;
      console.log("Fetching Parquet Data for:", parquetPath);

      const schemaResponse = await apiClient.post("/parquet/schema", {
        parquetPath,
      });

      console.log("🚀 ~ fetchParquetInfo ~ schemaResponse:", schemaResponse);

      const schema =
        schemaResponse?.data?.data?.schema ||
        schemaResponse?.data?.schema ||
        [];
      setSchema(schema);

      const statDataResponse = await apiClient.post("/parquet/stats", {
        parquetPath,
      });

      console.log(
        "🚀 ~ fetchParquetInfo ~ statDataResponse:",
        statDataResponse
      );

      console.log(
        "🚀 ~ fetchParquetInfo ~ statDataResponse.data.data:",
        statDataResponse.data.countRows
      );

      const rowGroups =
        statDataResponse?.data?.countRowGroups?.[0]?.rgcount || 0;
      const rows = statDataResponse.data.countRows || [];
      console.log(rows);
      const columnStats = statDataResponse.data.getRange || [];

      setRowGroups(rowGroups);
      setRows(rows);
      setColumnStats(columnStats);
    } catch (error) {
      console.error("Error fetching Parquet info:", error);
      toast.error("Failed to fetch Parquet info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParquetInfo();
  }, [selectedTable]);

  if (loading) {
    return <div className="text-center text-black">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white text-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
        Parquet Table: <span className="text-blue-600">{selectedTable}</span>
      </h2>

      {/* Table Schema */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Schema</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Column Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Nullable</TableHead>
                <TableHead>Key</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schema.map((col, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{col.column_name}</TableCell>
                  <TableCell>{col.column_type}</TableCell>
                  <TableCell>
                    {col.null === "YES" ? "✅ Yes" : "❌ No"}
                  </TableCell>
                  <TableCell>{col.key || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Row Groups & Row Counts */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Row Groups</h3>
        <p className="border border-gray-300 bg-gray-50 p-4 rounded-md">
          <span className="font-bold text-blue-600">Total Row Groups:</span>{" "}
          {rowGroups}
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Rows per Group</h3>
        <div className="border border-gray-300 bg-gray-50 p-4 rounded-md">
          {rows.map((row, index) => (
            <p key={index}>
              <span className="font-semibold text-blue-600">
                Group {row.row_group_id}:
              </span>{" "}
              {row.row_group_num_rows} rows
            </p>
          ))}
        </div>
      </div>

      {/* Column Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Column Statistics</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Column ID</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columnStats.map((stat, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{stat.column_id}</TableCell>
                  <TableCell>{stat.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ParquetInfo;
