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

interface DeltaTableSchemaProps {
  selectedTable: string;
}

const DeltaTableSchema = ({ selectedTable }: DeltaTableSchemaProps) => {
  const [loading, setLoading] = useState(false);
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  const fetchSchema = async (commitPath: string) => {
    setLoading(true);
    try {
      const schemaResponse = await apiClient.post("/delta/schema", {
        fileDirectory: `${basePath}/${commitPath}`,
      });
      console.log(`Schema :::: ${basePath}/${commitPath}`);
      console.log("🚀 ~ fetchSchema ~ schemaResponse:", schemaResponse.data);

      setSchema(JSON.parse(schemaResponse.data.schema));
    } catch (error) {
      toast.error("Failed to fetch schema");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (selectedTable: string) => {
    setLoading(true);
    try {
      const deltaDirectory = `${basePath}${selectedTable}`;
      console.log("🚀 ~ fetchCommits ~ deltaDirectory:", deltaDirectory);

      const commitResponse = await apiClient.post("/delta/commits", {
        deltaDirectory,
      });

      console.log("🚀 ~ fetchCommits ~ commitResponse:", commitResponse);
      const { commits, latestCommit } = commitResponse.data;

      if (!latestCommit) {
        toast.error("No commit data found");
        return;
      }

      setCommits(commits);
      setSelectedCommit(latestCommit.fileName);
      fetchSchema(latestCommit.path);
    } catch (error) {
      toast.error("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) fetchCommits(selectedTable);
<<<<<<< HEAD
  }, []);
=======
  }, [selectedTable]);
>>>>>>> 3cfe41a9d46e3f8725e4d45d051f3695f6abf8bf

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">
        Delta Table Schema - {selectedTable}
      </h2>

      {/* Commit Selector Dropdown */}
      {commits.length > 0 && (
        <Select
          value={selectedCommit || ""}
          onValueChange={(val) => {
            setSelectedCommit(val);
            const commit = commits.find((c) => c.fileName === val);
            if (commit) fetchSchema(commit.path);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a commit" />
          </SelectTrigger>
          <SelectContent>
            {commits.map((commit) => (
              <SelectItem key={commit.fileName} value={commit.fileName}>
                {commit.fileName} (v{commit.version})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Schema Table */}
      {loading ? (
        <p>Loading...</p>
      ) : schema ? (
        <div className="mt-4 p-4 border rounded-lg bg-gray-100">
          <h3 className="font-semibold text-md mb-2">Schema Fields</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Field Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Null Count
                </th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map((field: any) => (
                <tr key={field.name} className="border border-gray-300">
                  <td className="border border-gray-300 px-4 py-2">
                    {field.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {schema.nullCount?.[field.name] > 0
                      ? schema.nullCount[field.name]
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No schema data available</p>
      )}
    </div>
  );
};

export default DeltaTableSchema;
