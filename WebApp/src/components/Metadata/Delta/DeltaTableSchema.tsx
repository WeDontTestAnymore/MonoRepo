import { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { setCommits, clearCommits } from "@/contexts/delta.slice";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

interface TableSchemaProps {
  selectedTable: string;
}

const TableSchema = ({ selectedTable }: TableSchemaProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [schema, setSchema] = useState<any[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  let { allCommits, latestCommit } = useSelector(
    (state: RootState) => state.delta
  );
  const tableCred = useSelector(
    (state: RootState) => state.tableCred.tableCred
  );
  const currentTable = useSelector(
    (state: RootState) => state.delta.selectedTable
  );
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const dispatch = useDispatch<AppDispatch>();

  // Fetch schema for selected commit
  const fetchSchema = async (commit: string) => {
    setLoading(true);
    try {
      const fileDirectory = `${basePath}${selectedTable}/_delta_log/${commit}`;
      const response = await apiClient.post("/delta/schema", { fileDirectory });

      if (response.status === 200) {
        const schemaData = response.data?.schema;
        console.log("🚀 ~ fetchSchema ~ schemaData:", schemaData);
        const parsedSchema = schemaData
          ? JSON.parse(schemaData)
          : { fields: [] };

        console.log("🚀 ~ fetchSchema ~ parsedSchema:", parsedSchema);

        setSchema(parsedSchema.fields ?? []);
      } else {
        toast.error("Failed to fetch schema.");
      }
    } catch (error) {
      console.error("Error fetching schema:", error);
      toast.error("Error fetching schema.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelta = async () => {
    setLoading(true);
    console.log("allCommits:", allCommits);
    console.log("latestCommit:", latestCommit);
    console.log("currentTable:", currentTable);
    try {
      if (allCommits?.length > 0 && currentTable === selectedTable) {
        const fileDirectory = `${basePath}${selectedTable}/_delta_log/${latestCommit}`;

        console.log("Inside else");

        const latestCommitResponse = await apiClient.post("/delta/schema", {
          fileDirectory: fileDirectory,
        });

        if (latestCommitResponse.status === 200) {
          setSchema(latestCommitResponse.data?.schema?.fields ?? []);
        } else {
          console.error("Failed to fetch latest commit schema.");
        }
      } else {
        const deltaDirectory = tableCred?.find((t) =>
          t.path.includes(selectedTable)
        );
        console.log("🚀 ~ handleDelta ~ deltaDirectory:", deltaDirectory);

        if (!deltaDirectory) {
          console.error("Delta directory not found");
          setLoading(false);
          return;
        }

        try {
          const path = deltaDirectory.path.replace(/\/$/, "");
          console.log("🚀 ~ handleDelta ~ path:", path);

          const commitResponse = await apiClient.post("/delta/commits", {
            deltaDirectory: path,
          });
          console.log("🚀 ~ handleDelta ~ commitResponse:", commitResponse);

          if (commitResponse.status === 200 && commitResponse.data.commits) {
            dispatch(
              setCommits({
                allCommits: commitResponse.data.commits.map(
                  (c: any) => c.fileName
                ),
                latestCommit: commitResponse.data.latestCommit.fileName,
                oldestCommit: commitResponse.data.oldestCommit.fileName,
                selectedTable: selectedTable,
              })
            );

            allCommits = commitResponse.data.commits.map(
              (c: any) => c.fileName
            );
            console.log("🚀 ~ handleDelta ~ allCommits:", allCommits);
            latestCommit = commitResponse.data.latestCommit.fileName;
            console.log("🚀 ~ handleDelta ~ latestCommit:", latestCommit);

            const fileDirectory = `${basePath}${selectedTable}/_delta_log/${latestCommit}`;

            console.log("🚀 ~ handleDelta ~ fileDirectory 1:", fileDirectory);

            const latestCommitResponse = await apiClient.post("/delta/schema", {
              fileDirectory: fileDirectory,
            });

            console.log(
              "🚀 ~ handleDelta ~ latestCommitResponse:",
              latestCommitResponse
            );

            if (latestCommitResponse.status === 200) {
              setSchema(latestCommitResponse.data?.schema?.fields ?? []);
            } else {
              console.error("Failed to fetch latest commit schema.");
            }
          }
        } catch (error) {
          console.error("Error fetching delta table schema:", error);
          toast.error("Error fetching delta table schema.");
        }
      }
    } catch (error) {
      console.error("Error fetching delta table schema:", error);
      toast.error("Error fetching delta table schema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSchema([]); // Reset schema when table changes
    setSelectedCommit(null); // Reset selected commit
    if (currentTable !== selectedTable) {
      dispatch(clearCommits());
    }
    handleDelta();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-300">
      <h2 className="text-lg font-semibold mb-4">
        Table Schema: {selectedTable}
      </h2>

      {/* Commit Selector */}
      <div className="mb-4">
        <Select
          value={selectedCommit ?? ""}
          onValueChange={(value) => {
            setSelectedCommit(value);
            fetchSchema(value);
          }}
        >
          <SelectTrigger className="w-72 border-gray-300">
            <SelectValue placeholder="Select Commit" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black border-gray-300">
            {allCommits?.map((commit) => (
              <SelectItem key={commit} value={commit}>
                {commit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SQL Workbench Style Table */}
      <Table className="border-collapse w-full">
        <TableHeader>
          <TableRow className="bg-gray-100 border-b-2 border-gray-300">
            <TableHead className="font-mono text-sm px-4 py-2 border-r">
              Column Name
            </TableHead>
            <TableHead className="font-mono text-sm px-4 py-2 border-r">
              Data Type
            </TableHead>
            <TableHead className="font-mono text-sm px-4 py-2 border-r">
              Nullable
            </TableHead>
            <TableHead className="font-mono text-sm px-4 py-2">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : schema?.length > 0 ? (
            schema.map((col) => (
              <TableRow key={col.name} className="border-b border-gray-300">
                <TableCell className="font-mono text-sm px-4 py-2 border-r text-blue-700">
                  <FileText className="w-4 h-4 inline-block mr-2 text-blue-600" />{" "}
                  {col.name}
                </TableCell>
                <TableCell className="font-mono text-sm px-4 py-2 border-r">
                  {col.type}
                </TableCell>
                <TableCell className="font-mono text-sm px-4 py-2 border-r">
                  {col.nullable ? "YES" : "NO"}
                </TableCell>
                <TableCell className="text-sm px-4 py-2">
                  {col.metadata?.description || "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No schema data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSchema;
