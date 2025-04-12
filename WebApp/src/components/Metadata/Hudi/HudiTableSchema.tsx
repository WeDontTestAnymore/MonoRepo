import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Table as TableIcon, Download } from "lucide-react";
import apiClient from "@/services/axios.config";

interface HudiTableSchemaProps {
  selectedTable: string;
}

export default function HudiTableSchema({
  selectedTable,
}: HudiTableSchemaProps) {
  const [schema, setSchema] = useState<
    { name: string; type: string[]; default: any }[]
  >([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sampleSize, setSampleSize] = useState(3); // Default sample size

  const fetchHudiTableSchema = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const schemaResponse = await apiClient.post("/hudi/schema", {
        hudi_table_path: selectedTable.replace(/^\/+/, ""),
      });
      setSchema(schemaResponse.data || []);
    } catch (error) {
      console.error("Error fetching Hudi table schema:", error);
      toast.error("Error fetching schema. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSampleData = async () => {
    if (!selectedTable) return;
    try {
      const sampleResponse = await apiClient.post("/hudi/sample-data", {
        hudi_table_path: selectedTable.replace(/^\/+/, ""),
        row_limit: sampleSize,
      });

      // Extract the data array from response
      setSampleData(sampleResponse.data?.data || []);
    } catch (error) {
      console.error("Error fetching sample data:", error);
      toast.error("Error fetching sample data. Please try again.");
    }
  };

  useEffect(() => {
    fetchHudiTableSchema();
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      toast.success("Schema downloaded successfully!");
      setIsDownloading(false);
    }, 500);
  };

  if (loading) {
    return <div className="p-6">Loading schema...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl mb-6 flex items-center gap-2 text-gray-800">
        <TableIcon className="w-8 h-8 text-blue-600 kanit-extrabold" /> Table
        Schema: {selectedTable}
      </h2>

      {/* Schema Table */}
      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-300">
              <TableHead className="font-mono text-sm px-4 py-2 border-r">
                Column Name
              </TableHead>
              <TableHead className="font-mono text-sm px-4 py-2 border-r">
                Data Type
              </TableHead>
              <TableHead className="font-mono text-sm px-4 py-2">
                Default Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.map((col) => (
              <TableRow key={col.name} className="border-b border-gray-300">
                <TableCell className="font-mono text-sm px-4 py-2 border-r text-blue-700">
                  <FileText className="w-4 h-4 inline-block mr-2 text-blue-600" />{" "}
                  {col.name}
                </TableCell>
                <TableCell className="font-mono text-sm px-4 py-2 border-r">
                  {col.type.join(" ")}
                </TableCell>
                <TableCell className="text-sm px-4 py-2">
                  {col.default ?? "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sample Data Fetch Section */}
      <div className="flex items-center gap-4 mt-6">
        <span className="text-lg font-mono">Sample Size:</span>
        <Input
          type="number"
          value={sampleSize}
          onChange={(e) => {
            let value = Number(e.target.value);
            if (value < 1) value = 1;
            if (value > 20) value = 20;
            setSampleSize(value);
          }}
          className="w-20 text-center border border-gray-400 rounded-md px-2 py-1"
          min={1}
          max={20}
        />
        <Button
          onClick={fetchSampleData}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Fetch Sample Data
        </Button>
      </div>

      {/* Sample Data Display */}
      {sampleData.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-300 mt-6">
          <h3 className="text-xl mb-4 font-semibold text-gray-700">
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
                    <TableCell key={i} className="text-sm px-4 py-2">
                      {String(val ?? "N/A")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading..." : "Download Schema"}
        </Button>
      </div>
    </div>
  );
}
