import { useEffect, useState } from "react";
import apiClient from "@/services/axios.config";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface HudiTablePropertiesProps {
  selectedTable: string;
}

const HudiTableProperties = ({ selectedTable }: HudiTablePropertiesProps) => {
  const [loading, setLoading] = useState(false);
  const [partitions, setPartitions] = useState<any[]>([]);

  const fetchHudiTableSchema = async (tableName: string) => {
    const hudi_table_path = tableName.replace(/^\/+/, "");

    try {
      const response = await apiClient.post("/hudi/partitions", {
        hudi_table_path,
      });

      console.log("🚀 Response:", response.data);
      setPartitions(response.data?.partitions || []);
    } catch (error) {
      console.error("Error fetching Hudi table schema:", error);
      toast.error("Error fetching Hudi table schema. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      setLoading(true);
      fetchHudiTableSchema(selectedTable);
    }
  }, [selectedTable]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl mb-4 font-semibold text-gray-800">
        Hudi Table Partitions: {selectedTable}
      </h2>

      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className="text-sm px-4 py-2 border-r">
                Partition
              </TableHead>
              <TableHead className="text-sm px-4 py-2 border-r">
                Partition Key
              </TableHead>
              <TableHead className="text-sm px-4 py-2 border-r">
                Commit Time
              </TableHead>
              <TableHead className="text-sm px-4 py-2 border-r">
                Total Rows
              </TableHead>
              <TableHead className="text-sm px-4 py-2 border-r">
                Total Size (MB)
              </TableHead>
              <TableHead className="text-sm px-4 py-2">Row Groups</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partitions.length > 0 ? (
              partitions.map((partition, index) => (
                <TableRow key={index} className="border-b border-gray-300">
                  <TableCell className="px-4 py-2 border-r">
                    {partition.partition}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r">
                    {partition.partitionKey}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r">
                    {partition.commitTime}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r">
                    {partition.totalRows}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r">
                    {partition.totalSizeMB.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {partition.rowGroups}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No partitions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HudiTableProperties;
