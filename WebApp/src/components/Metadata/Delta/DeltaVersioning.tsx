import apiClient from "@/services/axios.config";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface DeltaVersioningProps {
  selectedTable: string;
}

const DeltaVersioning = ({ selectedTable }: DeltaVersioningProps) => {
  const [loading, setLoading] = useState(false);
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedFilePath1, setSelectedFilePath1] = useState<string | null>(
    null
  );
  const [selectedFilePath2, setSelectedFilePath2] = useState<string | null>(
    null
  );
  const [schema1, setSchema1] = useState<any>(null);
  const [schema2, setSchema2] = useState<any>(null);

  const fetchCommits = async (selectedTable: string) => {
    setLoading(true);
    try {
      const deltaDirectory = `${basePath}${selectedTable}`;
      console.log("🚀 ~ fetchCommits ~ deltaDirectory:", deltaDirectory);

      const commitResponse = await apiClient.post("/delta/commits", {
        deltaDirectory,
      });

      console.log("🚀 ~ fetchCommits ~ commitResponse:", commitResponse);
      const { commits, latestCommit, oldestCommit } = commitResponse.data;

      if (!latestCommit) {
        toast.error("No commit data found");
        return;
      }

      setCommits(commits);
      setSelectedFilePath1(`${deltaDirectory}/${latestCommit.fileName}`);
      setSelectedFilePath2(`${deltaDirectory}/${oldestCommit.fileName}`);
    } catch (error) {
      toast.error("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async (
    filePath: string | null,
    setSchema: (schema: any) => void
  ) => {
    if (!filePath) return;
    setLoading(true);
    try {
      const schemaResponse = await apiClient.post("/delta/schema", {
        fileDirectory: filePath,
      });

      console.log(`Schema ::: ${filePath}`);
      console.log("🚀 ~ fetchSchema ~ schemaResponse:", schemaResponse.data);

      setSchema(JSON.parse(schemaResponse.data.schema));
    } catch (error) {
      toast.error("Failed to fetch schema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) fetchCommits(selectedTable);
  }, [selectedTable]);

  useEffect(() => {
    if (selectedFilePath1) fetchSchema(selectedFilePath1, setSchema1);
  }, [selectedFilePath1]);

  useEffect(() => {
    if (selectedFilePath2) fetchSchema(selectedFilePath2, setSchema2);
  }, [selectedFilePath2]);

  /** Compare schemas */
  const compareSchemas = () => {
    if (!schema1 || !schema2) return [];

    const allFields = [
      ...new Set([...Object.keys(schema1), ...Object.keys(schema2)]),
    ];

    return allFields.map((field) => {
      const type1 = schema1[field];
      const type2 = schema2[field];

      if (type1 === undefined)
        return { field, change: "🟢 Added", type: type2 };
      if (type2 === undefined)
        return { field, change: "🔴 Removed", type: type1 };
      if (type1 !== type2)
        return { field, change: "🟠 Modified", type: `${type1} → ${type2}` };

      return { field, change: "⚪ Unchanged", type: type1 };
    });
  };

  const schemaChanges = compareSchemas();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl mb-4 font-semibold">{`Delta Version: ${selectedTable}`}</h2>

      {/* Dropdowns for Selecting Commits */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="font-semibold text-gray-700 mb-1">Commit 1</label>
          <Select
            value={selectedFilePath1 || ""}
            onValueChange={setSelectedFilePath1}
          >
            <SelectTrigger className="w-60 bg-white border border-gray-300 p-2 rounded">
              <SelectValue placeholder="Select Commit 1" />
            </SelectTrigger>
            <SelectContent>
              {commits.map((c) => (
                <SelectItem
                  key={c.fileName}
                  value={`${basePath}${selectedTable}/${c.fileName}`}
                >
                  {c.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-semibold text-gray-700 mb-1">Commit 2</label>
          <Select
            value={selectedFilePath2 || ""}
            onValueChange={setSelectedFilePath2}
          >
            <SelectTrigger className="w-60 bg-white border border-gray-300 p-2 rounded">
              <SelectValue placeholder="Select Commit 2" />
            </SelectTrigger>
            <SelectContent>
              {commits.map((c) => (
                <SelectItem
                  key={c.fileName}
                  value={`${basePath}${selectedTable}/${c.fileName}`}
                >
                  {c.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schema Comparison */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Schema Changes</h3>
        <div className="border p-4 rounded-md bg-white text-black font-mono">
          {schemaChanges.length > 0 ? (
            schemaChanges.map((change) => (
              <div
                key={change.field}
                className={`py-1 px-2 rounded-md ${
                  change.change === "🔴 Removed"
                    ? "bg-red-200 text-red-900"
                    : change.change === "🟢 Added"
                    ? "bg-green-200 text-green-900"
                    : change.change === "🟠 Modified"
                    ? "bg-yellow-200 text-yellow-900"
                    : "bg-white"
                }`}
              >
                {change.change} {change.field}: {change.type}
              </div>
            ))
          ) : (
            <div className="text-green-600 font-semibold">
              No changes detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeltaVersioning;
