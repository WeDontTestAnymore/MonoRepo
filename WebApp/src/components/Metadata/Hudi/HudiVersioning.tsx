import { useEffect, useState } from "react";
import apiClient from "@/services/axios.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDiff } from "lucide-react";
import { toast } from "sonner";

interface HudiVersioningProps {
  selectedTable: string;
}

const HudiVersioning = ({ selectedTable }: HudiVersioningProps) => {
  const [loading, setLoading] = useState(false);
  interface VersionField {
    name: string;
    type: string;
  }

  interface Version {
    id: string;
    label: string;
    schema: VersionField[];
  }

  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion1, setSelectedVersion1] = useState("");
  const [selectedVersion2, setSelectedVersion2] = useState("");

  const fetchHudiVersioning = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/hudi/versioning", {
        hudi_table_path: tableName.replace(/^\/+/, ""),
      });

      if (response.status === 200) {
        interface VersionField {
          name: string;
          type: string;
        }

        interface Version {
          id: string;
          label: string;
          schema: VersionField[];
        }

        const fetchedVersions: Version[] = response.data.versioning_history.map(
          (v: { last_modified: string; schema: { name: string; type: string[] }[] }, index: number) => ({
            id: `v${index + 1}`,
            label: `Version ${index + 1} (${new Date(
              v.last_modified
            ).toLocaleDateString()})`,
            schema: v.schema.map((field) => ({
              name: field.name,
              type: field.type[0], // Extract type from array
            })),
          })
        );

        setVersions(fetchedVersions);
        setSelectedVersion1(fetchedVersions[0]?.id || "");
        setSelectedVersion2(fetchedVersions[1]?.id || "");
      }
    } catch (error) {
      console.error("Error fetching Hudi versioning data:", error);
      toast.error("Error fetching Hudi versioning data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      fetchHudiVersioning(selectedTable);
    }
  }, [selectedTable]);

  if (loading) return <div>Loading...</div>;
  if (!versions.length) return <div>No versioning data available.</div>;

  const version1 = versions.find((v) => v.id === selectedVersion1);
  const version2 = versions.find((v) => v.id === selectedVersion2);

  const allFields = [
    ...new Set([
      ...(version1?.schema || []).map((f) => f.name),
      ...(version2?.schema || []).map((f) => f.name),
    ]),
  ];

  const changes = allFields.map((field) => {
    const fieldV1 = version1?.schema.find((f) => f.name === field);
    const fieldV2 = version2?.schema.find((f) => f.name === field);

    if (!fieldV2)
      return { name: field, type: fieldV1?.type, status: "removed" }; // 🔴 Removed
    if (!fieldV1) return { name: field, type: fieldV2?.type, status: "added" }; // 🟢 Added
    if (fieldV1.type !== fieldV2.type)
      return {
        name: field,
        type: `${fieldV1.type} → ${fieldV2.type}`,
        status: "modified",
      }; // 🟠 Modified
    return { name: field, type: fieldV1.type, status: "unchanged" };
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl mb-6 flex items-center gap-2">
        <FileDiff className="w-8 h-8 text-blue-500" /> Hudi Versioning:{" "}
        {selectedTable}
      </h2>

      {/* Dropdowns for Selecting Versions */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Compare Version 1
          </label>
          <Select value={selectedVersion1} onValueChange={setSelectedVersion1}>
            <SelectTrigger className="w-60 bg-white border border-gray-300 p-2 rounded">
              <SelectValue placeholder="Select Version 1" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Compare Version 2
          </label>
          <Select value={selectedVersion2} onValueChange={setSelectedVersion2}>
            <SelectTrigger className="w-60 bg-white border border-gray-300 p-2 rounded">
              <SelectValue placeholder="Select Version 2" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schema Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Version 1 Schema */}
        {version1 && (
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">
              {version1.label} Schema
            </h3>
            <div className="border p-4 rounded-md bg-white text-black font-mono">
              {version1.schema.map((field) => (
                <div key={field.name} className="py-1">
                  {field.name}: {field.type}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Version 2 Schema */}
        {version2 && (
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">
              {version2.label} Schema
            </h3>
            <div className="border p-4 rounded-md bg-white text-black font-mono">
              {version2.schema.map((field) => (
                <div key={field.name} className="py-1">
                  {field.name}: {field.type}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schema Changes */}
      <div className="bg-white shadow-md rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold mb-3">Schema Changes</h3>
        <div className="border p-4 rounded-md bg-white text-black font-mono">
          {changes.map((change) => (
            <div
              key={change.name}
              className={`py-1 px-2 rounded-md ${
                change.status === "removed"
                  ? "bg-red-200 text-red-900"
                  : change.status === "added"
                  ? "bg-green-200 text-green-900"
                  : change.status === "modified"
                  ? "bg-yellow-200 text-yellow-900"
                  : "bg-white"
              }`}
            >
              {change.status === "removed" && "- "}
              {change.status === "added" && "+ "}
              {change.status === "modified" && "~ "}
              {change.name}: {change.type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HudiVersioning;
