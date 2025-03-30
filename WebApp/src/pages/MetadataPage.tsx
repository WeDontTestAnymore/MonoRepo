import { useEffect, useState } from "react";
import Sidebar from "@/components/Metadata/Sidebar";
import TableSchema from "@/components/Metadata/TableSchema";
import TableProperties from "@/components/Metadata/TableProperties";
import QueryBuilder from "@/components/Metadata/QueryBuilder";
import SchemaViewer from "@/components/Metadata/SchemaViewer";
import Versioning from "@/components/Metadata/Versioning";
import KeyMetrics from "@/components/Metadata/KeyMetrics";
import { Toaster } from "sonner";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import apiClient from "@/services/axios.config";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { setTableCred, setBasePath } from "@/contexts/tableCred.slice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeltaTableSchema from "@/components/Metadata/Delta/DeltaTableSchema";

const MetadataPage = () => {
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [activeSection, setActiveSection] = useState("Schemas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [tableType, setTableType] = useState("delta");

  const tableCred = useSelector(
    (state: RootState) => state.tableCred.tableCred
  );

  const dispatch = useDispatch<AppDispatch>();

  const tableCredentials = useSelector(
    (state: RootState) => state.tableCred.tableCred
  ); // ✅ Move outside

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await apiClient.post("/bucket/scan");
        if (response.status === 200) {
          dispatch(setTableCred(response.data.tables));

          // Extract base path (e.g., "s3://datalake")
          const firstPath = response.data.tables[0]?.path || "";
          const extractedBasePath = firstPath.split("/").slice(0, 3).join("/");

          dispatch(setBasePath(extractedBasePath)); // Store base path in Redux

          const tableNames = response.data.tables.map((t: any) => {
            const segments = t.path.split("/");
            const tableName = segments[segments.length - 2]; // Extracts table name
            return `/${t.type.toLowerCase()}/${tableName}`; // Formats as /delta/table or /iceberg/table
          });

          setAvailableTables(tableNames);
          setSelectedTable(tableNames[0] || "");
        } else {
          console.error("Failed to fetch table metadata.");
        }
      } catch (error: any) {
        console.error("Error fetching tables:", error);
      }
    };

    if (!tableCredentials) {
      fetchTables();
    } else {
      const tableNames = tableCredentials.map((t) => {
        const tableName = t.path
          .replace("s3://datalake/", "")
          .replace(/\/$/, ""); // Remove prefix & trailing slash
        return `/${tableName}`;
      });

      setAvailableTables(tableNames);
      setSelectedTable(tableNames[0] || "");
    }
  }, [tableCredentials, dispatch]);

  const handleDiscoverPath = async () => {
    try {
      const response = await apiClient.post("/discover/path", {
        path: newPath.replace(/\/$/, ""), // Remove trailing slash
        type: tableType,
      });

      if (response.status === 200) {
        console.log("Path discovered:", response.data);
        setIsDialogOpen(false);
      } else {
        console.error("Failed to discover path.");
      }
    } catch (error) {
      console.error("Error discovering path:", error);
    }
  };

  const getTableType = (selectedTable: string) => {
    const table = tableCred?.find((t) => t.path.includes(selectedTable));

    return table ? table.type : "unknown";
  };

  useEffect(() => {
    const tableType = getTableType(selectedTable);
    setTableType(tableType);
  }),
    [selectedTable];

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <Sidebar
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        setActiveSection={setActiveSection}
        availableTables={availableTables}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="p-4 shadow rounded bg-white">
            {activeSection === "Schemas" &&
              (tableType === "DELTA" ? (
                <DeltaTableSchema selectedTable={selectedTable} />
              ) : (
                <TableSchema selectedTable={selectedTable} />
              ))}
            {activeSection === "Properties" && (
              <TableProperties selectedTable={selectedTable} />
            )}
            {activeSection === "Versioning & Snapshots" && (
              <Versioning selectedTable={selectedTable} />
            )}
            {activeSection === "Key Metrics" && (
              <KeyMetrics selectedTable={selectedTable} />
            )}
            {activeSection === "Schema Viewer" && <SchemaViewer />}
            {activeSection === "Run Query" && <QueryBuilder />}
          </div>
        </div>
        <Toaster />
      </div>

      {/* Floating Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-900">
            Discover New Path
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Discover New Path</h2>
          <div className="flex space-x-4">
            {/* Input - 3 parts */}
            <div className="flex-[3]">
              <Input
                className="text-black border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter path (e.g., s3://datalake/path)"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />
            </div>
            {/* Dropdown - 1 part */}
            <div className="flex-[1]">
              <Select value={tableType} onValueChange={setTableType}>
                <SelectTrigger className=" text-black border-gray-700 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300">
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="delta">Delta</SelectItem>
                  <SelectItem value="hudi">Hudi</SelectItem>
                  <SelectItem value="iceberg">Iceberg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white"
            onClick={handleDiscoverPath}
          >
            Send
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetadataPage;
