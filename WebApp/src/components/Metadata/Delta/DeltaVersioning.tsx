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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeltaVersioningProps {
  selectedTable: string;
}

const DeltaVersioning = ({ selectedTable }: DeltaVersioningProps) => {
  const [loading, setLoading] = useState(false);
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const [selectedFilePath1, setSelectedFilePath1] = useState<string | null>(
    null
  );
  const [selectedFilePath2, setSelectedFilePath2] = useState<string | null>(
    null
  );

  const [commitInput1, setCommitInput1] = useState("");
  const [commitInput2, setCommitInput2] = useState("");
  const [checkpoint1, setCheckpoint1] = useState("");
  const [checkpoint2, setCheckpoint2] = useState("");
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const [deltaDirectory, setDeltaDirectory] = useState("");
  const [commits, setCommits] = useState<string[]>([]);

  const [mode1, setMode1] = useState<"commit" | "checkpoint">("commit");
  const [mode2, setMode2] = useState<"commit" | "checkpoint">("commit");

  const [schema1, setSchema1] = useState<any>(null);
  const [schema2, setSchema2] = useState<any>(null);

  const fetchCommits = async (selectedTable: string) => {
    setLoading(true);
    try {
      const dir = `${basePath}/${selectedTable}`;
      setDeltaDirectory(dir);

      const commitResponse = await apiClient.post("/delta/commits", {
        deltaDirectory: dir,
      });

      const { lastCommit, checkpointFiles } = commitResponse.data;
      if (!lastCommit) {
        toast.error("No commit data found");
        return;
      }

      const maxCommitNum = parseInt(lastCommit.replace(".json", ""));
      let commitArr: string[] = [];
      for (let i = 0; i <= maxCommitNum; i++) {
        commitArr.push(i.toString().padStart(20, "0") + ".json");
      }
      setCommits(commitArr);
      setCheckpoints(checkpointFiles);

      setCommitInput1(lastCommit);
      setCommitInput2("");
      setCheckpoint1("");
      setCheckpoint2(checkpointFiles[0] ? checkpointFiles[0] : "");
    } catch (error) {
      toast.error("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode1 === "checkpoint" && checkpoint1) {
      setSelectedFilePath1(`${deltaDirectory}/${checkpoint1}`);
    }
  }, [checkpoint1, mode1, deltaDirectory]);

  useEffect(() => {
    if (mode2 === "checkpoint" && checkpoint2) {
      setSelectedFilePath2(`${deltaDirectory}/${checkpoint2}`);
    }
  }, [checkpoint2, mode2, deltaDirectory]);

  const fetchSchemaFromMode = async (
    mode: "commit" | "checkpoint",
    identifier: string,
    setSchema: (schema: any) => void
  ) => {
    if (!identifier) return;
    setLoading(true);
    try {
      let schemaResponse;
      if (mode === "commit") {
        schemaResponse = await apiClient.post("/delta/commitSchema", {
          deltaDirectory,
          commitName: identifier,
        });
      } else {
        // Insert /_delta_log/ between directory and file name for checkpoint
        const checkpointFileName = identifier.split("/").pop();
        const modifiedFilePath = `${deltaDirectory}/_delta_log/${checkpointFileName}`;
        schemaResponse = await apiClient.post("/delta/checkpointSchema", {
          deltaDirectory,
          filePath: modifiedFilePath,
        });
      }
      console.log(`Schema ::: ${identifier}`);
      console.log("🚀 ~ fetchSchemaFromMode ~ schemaResponse:", schemaResponse.data);
      setSchema(schemaResponse.data.schema);
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
    if (selectedFilePath1 && mode1 === "checkpoint")
      fetchSchemaFromMode("checkpoint", selectedFilePath1, setSchema1);
  }, [selectedFilePath1, mode1]);

  useEffect(() => {
    if (selectedFilePath2 && mode2 === "checkpoint")
      fetchSchemaFromMode("checkpoint", selectedFilePath2, setSchema2);
  }, [selectedFilePath2, mode2]);

  const compareSchemas = () => {
    if (!schema1 || !schema2) return [];
    const fields1 = schema1?.fields || schema1?.schema?.fields || [];
    const fields2 = schema2?.fields || schema2?.schema?.fields || [];
    const allFieldNames = Array.from(
      new Set([...fields1.map((f: any) => f.name), ...fields2.map((f: any) => f.name)])
    );
    return allFieldNames.map((fieldName) => {
      const f1 = fields1.find((f: any) => f.name === fieldName);
      const f2 = fields2.find((f: any) => f.name === fieldName);
      if (!f1) return { field: fieldName, status: 'added', type: f2.type };
      if (!f2) return { field: fieldName, status: 'removed', type: f1.type };
      if (f1.type !== f2.type)
        return { field: fieldName, status: 'modified', type: `${f1.type} → ${f2.type}` };
      return { field: fieldName, status: 'unchanged', type: f1.type };
    });
  };

  const schemaChanges = compareSchemas();

  const handleLoadSchema1 = () => {
    if (commitInput1) {
      const fullPath = `${deltaDirectory}/${commitInput1}`;
      setSelectedFilePath1(fullPath);
      fetchSchemaFromMode("commit", commitInput1, setSchema1);
    }
  };

  const handleLoadSchema2 = () => {
    if (commitInput2) {
      const fullPath = `${deltaDirectory}/${commitInput2}`;
      setSelectedFilePath2(fullPath);
      fetchSchemaFromMode("commit", commitInput2, setSchema2);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl mb-4 font-semibold">{`Delta Version: ${selectedTable}`}</h2>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Schema 1 Source</h3>
          <div className="mb-2">
            <span className="mr-2 font-semibold">Mode:</span>
            <Button
              variant="outline"
              size="sm"
              className={`mr-2 ${mode1 === "commit" ? "bg-gray-300" : ""}`}
              onClick={() => setMode1("commit")}
            >
              Commit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${mode1 === "checkpoint" ? "bg-gray-300" : ""}`}
              onClick={() => setMode1("checkpoint")}
            >
              Checkpoint
            </Button>
          </div>
          {mode1 === "commit" ? (
            <div className="flex items-center mb-2">
              <Input
                className="w-full"
                value={commitInput1}
                onChange={(e) => setCommitInput1(e.target.value)}
                placeholder={`Commit (max: ${commits[commits.length - 1] || ""})`}
              />
              <Button onClick={handleLoadSchema1} className="ml-2">
                Load
              </Button>
            </div>
          ) : (
            <div className="mb-2">
              <Select value={checkpoint1 || ""} onValueChange={setCheckpoint1}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Checkpoint" />
                </SelectTrigger>
                <SelectContent>
                  {checkpoints.map((cp) => (
                    <SelectItem key={cp} value={cp}>
                      {cp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Schema 2 Source</h3>
          <div className="mb-2">
            <span className="mr-2 font-semibold">Mode:</span>
            <Button
              variant="outline"
              size="sm"
              className={`mr-2 ${mode2 === "commit" ? "bg-gray-300" : ""}`}
              onClick={() => setMode2("commit")}
            >
              Commit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${mode2 === "checkpoint" ? "bg-gray-300" : ""}`}
              onClick={() => setMode2("checkpoint")}
            >
              Checkpoint
            </Button>
          </div>
          {mode2 === "commit" ? (
            <div className="flex items-center mb-2">
              <Input
                className="w-full"
                value={commitInput2}
                onChange={(e) => setCommitInput2(e.target.value)}
                placeholder={`Commit (max: ${commits[commits.length - 1] || ""})`}
              />
              <Button onClick={handleLoadSchema2} className="ml-2">
                Load
              </Button>
            </div>
          ) : (
            <div className="mb-2">
              <Select value={checkpoint2 || ""} onValueChange={setCheckpoint2}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Checkpoint" />
                </SelectTrigger>
                <SelectContent>
                  {checkpoints.map((cp) => (
                    <SelectItem key={cp} value={cp}>
                      {cp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Schema 1</h3>
          <div className="border p-4 rounded-md bg-white text-black font-mono">
            {(schema1?.fields || schema1?.schema?.fields || []).map((field: any) => (
              <div key={field.name} className="py-1">
                {field.name}: {field.type}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Schema 2</h3>
          <div className="border p-4 rounded-md bg-white text-black font-mono">
            {(schema2?.fields || schema2?.schema?.fields || []).map((field: any) => (
              <div key={field.name} className="py-1">
                {field.name}: {field.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Schema Changes</h3>
        <div className="border p-4 rounded-md bg-white text-black font-mono">
          {schemaChanges.length > 0 ? (
            schemaChanges.map((change) => (
              <div
                key={change.field}
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
                {change.field}: {change.type}
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
