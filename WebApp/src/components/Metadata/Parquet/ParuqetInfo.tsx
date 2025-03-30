import { useState, useEffect } from "react";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

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

      const parquetPath = `${basePath}/${selectedTable}`;
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

      const rowGroups =
        statDataResponse?.data?.data?.countRowGroups?.[0]?.rgcount || 0;
      const rows = statDataResponse?.data?.data?.countRows || [];
      console.log(rows);
      const columnStats = statDataResponse?.data?.data?.getRange || [];

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
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="p-4 bg-[#1E1E1E] text-white rounded-lg">
      <h2 className="text-lg font-semibold mb-2">
        Parquet Table: {selectedTable}
      </h2>

      {/* Table Schema */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-1">Schema</h3>
        <div className="bg-[#2C2C2C] p-3 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600 text-left">
                <th className="p-2">Column Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Nullable</th>
                <th className="p-2">Key</th>
              </tr>
            </thead>
            <tbody>
              {schema.map((col, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">{col.column_name}</td>
                  <td className="p-2">{col.column_type}</td>
                  <td className="p-2">
                    {col.null === "YES" ? "✅ Yes" : "❌ No"}
                  </td>
                  <td className="p-2">{col.key || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Groups & Row Counts */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-1">Row Groups</h3>
        <p className="bg-[#2C2C2C] p-3 rounded-md">
          Total Row Groups: {rowGroups}
        </p>

        <h3 className="text-md font-semibold mt-3">Rows per Group</h3>
        <div className="bg-[#2C2C2C] p-3 rounded-md">
          {rows.map((row, index) => (
            <p key={index}>
              Group {row.row_group_id}: {row.row_group_num_rows} rows
            </p>
          ))}
        </div>
      </div>

      {/* Column Statistics */}
      <div>
        <h3 className="text-md font-semibold mb-1">Column Statistics</h3>
        <div className="bg-[#2C2C2C] p-3 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600 text-left">
                <th className="p-2">Column ID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Min</th>
                <th className="p-2">Max</th>
              </tr>
            </thead>
            <tbody>
              {columnStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">{stat.column_id}</td>
                  <td className="p-2">{stat.type}</td>
                  <td className="p-2">{stat.stats_min || "N/A"}</td>
                  <td className="p-2">{stat.stats_max || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParquetInfo;
