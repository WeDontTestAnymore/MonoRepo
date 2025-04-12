import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FileText, Table as TableIcon } from "lucide-react";

interface IcebergTableSchemaProps {
  selectedTable: string;
}

const IcebergTableSchema = ({ selectedTable }: IcebergTableSchemaProps) => {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<any[]>([]);
  const [partitions, setPartitions] = useState<any[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const icebergPath = `${basePath}/${selectedTable}`;
      const schemaResponse = await apiClient.post("/iceberg/schema/details", {
        icebergPath,
      });
      console.log("🚀 ~ fetchSchema ~ schemaResponse:", schemaResponse);

      setSchema(schemaResponse.data.schema || []);
      setPartitions(schemaResponse.data.partitionDetails || []);

      if (schemaResponse.status === 200) {
        const sampleDataResponse = await apiClient.post(
          "/iceberg/schema/sampleData",
          {
            icebergPath,
          }
        );
        console.log(
          "🚀 ~ fetchSchema ~ sampleDataResponse:",
          sampleDataResponse
        );
        setSampleData(sampleDataResponse.data.sampleData || []);
      }
    } catch (error) {
      toast.error("Failed to fetch schema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) fetchSchema();
  }, []);

  if (loading) {
    return <div className="p-6">Loading schema...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl mb-6 flex items-center gap-2 text-gray-800">
        <TableIcon className="w-8 h-8 text-blue-600 kanit-extrabold" /> Iceberg
        Table: {selectedTable}
      </h2>

      {/* Schema Fields Table */}
      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Schema Fields
        </h3>
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className="font-mono text-sm px-4 py-2 border-r">
                Column Name
              </TableHead>
              <TableHead className="font-mono text-sm px-4 py-2 border-r">
                Type
              </TableHead>
              <TableHead className="font-mono text-sm px-4 py-2">
                Required
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.map((col) => (
              <TableRow key={col.id} className="border-b border-gray-300">
                <TableCell className="font-mono text-sm px-4 py-2 border-r text-blue-700">
                  <FileText className="w-4 h-4 inline-block mr-2 text-blue-600" />{" "}
                  {col.name}
                </TableCell>
                <TableCell className="font-mono text-sm px-4 py-2 border-r">
                  {col.type}
                </TableCell>
                <TableCell className="text-sm px-4 py-2">
                  {col.required ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Partition Details Table */}
      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Partition Details
        </h3>
        {partitions.length > 0 ? (
          <Table className="border-collapse w-full">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                <TableHead className="font-mono text-sm px-4 py-2 border-r">
                  Partition Column
                </TableHead>
                <TableHead className="font-mono text-sm px-4 py-2 border-r">
                  Transform
                </TableHead>
                <TableHead className="font-mono text-sm px-4 py-2">
                  Source ID
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partitions.map((part) => (
                <TableRow
                  key={part["field-id"]}
                  className="border-b border-gray-300"
                >
                  <TableCell className="font-mono text-sm px-4 py-2 border-r text-green-700">
                    {part.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm px-4 py-2 border-r">
                    {part.transform}
                  </TableCell>
                  <TableCell className="text-sm px-4 py-2">
                    {part["source-id"]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-gray-600 font-mono text-sm">
            No partition details available.
          </div>
        )}
      </div>

      {/* Sample Data Table */}
      {sampleData.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Sample Data
          </h3>
          <Table className="border-collapse w-full">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                {Object.keys(sampleData[0]).map((key) => (
                  <TableHead
                    key={key}
                    className="font-mono text-sm px-4 py-2 border-r"
                  >
                    {key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row, idx) => (
                <TableRow key={idx} className="border-b border-gray-300">
                  {Object.values(row).map((val, i) => (
                    <TableCell key={i} className="text-sm px-4 py-2 border-r">
                      {val?.toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IcebergTableSchema;
