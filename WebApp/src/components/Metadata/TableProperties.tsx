import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";

interface TablePropertiesProps {
  selectedTable: string;
}

const TableProperties = ({ selectedTable }: TablePropertiesProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataToShow, setDataToShow] = useState<any>(null);

  const tableCred = useSelector(
    (state: RootState) => state.tableCred.tableCred
  );

  const handleHudi = async () => {
    setLoading(true);
    try {
      console.log("🚀 ~ handleHudi ~ selectedTable:", selectedTable);
      const hudi_table_path = selectedTable.split("/").slice(1).join("/");
      console.log("🚀 ~ handleHudi ~ hudi_table_path:", hudi_table_path);

      const response = await apiClient.post("/hudi/partitions", {
        hudi_table_path: hudi_table_path,
      });

      console.log("🚀 ~ handleHudi ~ response:", response);

      if (response.status === 200) {
        console.log("🚀 ~ handleHudi ~ response.data:", response.data);
        setDataToShow(response.data.schema);
      } else {
        console.error("Failed to fetch Hudi table schema.");
      }
    } catch (error) {
      console.error("Error fetching Hudi table schema:", error);
      toast.error("Error fetching Hudi table schema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const table = tableCred?.find((t) => t.path.includes(selectedTable));

    if (table) {
      const { type } = table;
      if (type === "DELTA") {
        setDataToShow(null); // Clear previous data
      } else if (type === "HUDI") {
        setDataToShow(null);
        handleHudi();
      } else if (type === "ICEBERG") {
        setDataToShow(null);
      }
    }
  }, [selectedTable]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Table Properties: {selectedTable}</h2>
      {dataToShow}
    </div>
  );
};

export default TableProperties;
