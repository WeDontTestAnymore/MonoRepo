import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DeltaTableSchemaProps {
  selectedTable: string;
}

const DeltaTableSchema = ({ selectedTable }: DeltaTableSchemaProps) => {
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [schema, setSchema] = useState<any[]>([]);
  const [snapshotdata, setSnapshotData] = useState<any[]>([]);
  const [limit, setLimit] = useState(10);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchCommits = async () => {
    setLoading(true);
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedTable}`;
      const commmitResponse = await apiClient.post("/delta/commits", {
        deltaDirectory: reqPath,
      });

      const reqCommitPath = commmitResponse.data.lastCommit.endsWith(".json")
        ? commmitResponse.data.lastCommit.slice(0, -5)
        : commmitResponse.data.lastCommit;
      console.log("🚀 ~ fetchCommits ~ reqCommitPath:", reqCommitPath);

      const schemaResponse = await apiClient.post("/delta/commitSchema", {
        deltaDirectory: reqPath,
        commitName: reqCommitPath,
      });
      console.log("🚀 ~ fetchSchema ~ schemaResponse:", schemaResponse.data);
      setSchema(schemaResponse.data.fields);

      const snapshotResponse = await apiClient.post("/delta/snapshots", {
        deltaDirectory: reqPath,
      });
      console.log(
        "🚀 ~ fetchCommits ~ snapshotResponse:",
        snapshotResponse.data
      );
      setSnapshots(snapshotResponse.data.snapshots);
    } catch (error) {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const fetchSnapshotSampleData = async () => {
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedSnapshot}`;
      console.log("🚀 ~ fetchSnapshotSampleData ~ reqPath3:", reqPath);

      const dataResponse = await apiClient.post("/delta/sampleData", {
        filePath: reqPath,
        limit: limit,
      });
      console.log(
        "🚀 ~ fetchSnapshotSampleData ~ dataResponse:",
        dataResponse.data
      );
      setSnapshotData(dataResponse.data.data);
    } catch (error) {
      toast.error("Failed to fetch schema");
    }
  };

  useEffect(() => {
    if (selectedTable) fetchCommits();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-500" /> Delta Table Schema:{" "}
        {selectedTable}
      </h2>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Schema</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Field</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.map((field) => (
              <TableRow key={field.name}>
                <TableCell className="font-medium">{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-white mt-6 shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Snapshot Data</h3>
        <div className="flex gap-4 items-center mb-4">
          {/* Snapshot Select */}
          <div className="w-1/3">
            <Select onValueChange={(val) => setSelectedSnapshot(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Snapshot ID" />
              </SelectTrigger>
              <SelectContent>
                {snapshots.map((snap) => (
                  <SelectItem key={snap} value={snap}>
                    {snap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Limit Input */}
          <Input
            type="number"
            min={1}
            placeholder="Limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-24"
          />

          {/* Fetch Button */}
          <Button onClick={() => selectedSnapshot && fetchSnapshotSampleData()}>
            Fetch Data
          </Button>
        </div>

        {/* Snapshot Data Table */}
        {snapshotdata.length > 0 && (
          <div className="overflow-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(snapshotdata[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshotdata.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val, i) => (
                      <TableCell key={i}>{val?.toString()}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeltaTableSchema;
