import { useEffect, useState } from "react";
import Sidebar from "@/components/Metadata/Sidebar";
import TableSchema from "@/components/Metadata/TableSchema";
import TableProperties from "@/components/Metadata/TableProperties";
import QueryBuilder from "@/components/Metadata/QueryBuilder";
import SchemaViewer from "@/components/Metadata/SchemaViewer";
import Versioning from "@/components/Metadata/Versioning";
import PartitionDetails from "@/components/Metadata/PartitionDetails";
import KeyMetrics from "@/components/Metadata/KeyMetrics";
import { Toaster } from "sonner";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import apiClient from "@/services/axios.config";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { setTableCred, setBasePath } from "@/contexts/tableCred.slice";

const MetadataPage = () => {
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [activeSection, setActiveSection] = useState("Schemas");

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
        const segments = t.path.split("/");
        const tableName = segments[segments.length - 2];
        return `/${t.type.toLowerCase()}/${tableName}`;
      });

      setAvailableTables(tableNames);
      setSelectedTable(tableNames[0] || "");
    }
  }, [tableCredentials, dispatch]);

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
            {activeSection === "Schemas" && (
              <TableSchema selectedTable={selectedTable} />
            )}
            {activeSection === "Properties" && (
              <TableProperties selectedTable={selectedTable} />
            )}
            {activeSection === "Partition Details" && (
              <PartitionDetails selectedTable={selectedTable} />
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
    </div>
  );
};

export default MetadataPage;
