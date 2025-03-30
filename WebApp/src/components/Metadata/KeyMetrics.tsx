import { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { setCommits } from "@/contexts/delta.slice";

interface KeyMetricsProps {
  selectedTable: string;
}

const KeyMetrics = ({ selectedTable }: KeyMetricsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataToShow, setDataToShow] = useState<any>(null);

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

  const handleDelta = async () => {
    setLoading(true);
    try {
      if (allCommits.length > 0 && currentTable === selectedTable) {
        const fileDirectory = `${basePath}${selectedTable}/_delta_log/${latestCommit}`;
        console.log("🚀 ~ handleDelta ~ fileDirectory:", fileDirectory);
        const latestCommitResponse = await apiClient.post("/delta/stats", {
          fileDirectory: fileDirectory,
        });
        console.log(
          "🚀 ~ handleDelta ~ latestCommitResponse:",
          latestCommitResponse
        );

        if (latestCommitResponse.status === 200) {
          setDataToShow(latestCommitResponse.data.schema);
        } else {
          toast.error("Failed to fetch latest commit schema.");
        }
      } else {
        const deltaDirectory = tableCred?.find(
          (t) => t.path.includes(selectedTable) // Instead of endsWith()
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

            console.log("🚀 ~ handleDelta ~ fileDirectory:", fileDirectory);
            const latestCommitResponse = await apiClient.post("/delta/stats", {
              fileDirectory: fileDirectory,
            });
            console.log(
              "🚀 ~ handleDelta ~ latestCommitResponse:",
              latestCommitResponse
            );

            if (latestCommitResponse.status === 200) {
              setDataToShow(latestCommitResponse.data.schema);
            } else {
              console.error("Failed to fetch latest commit schema.");
            }
          } else {
            toast.error("Failed to fetch commits");
          }
        } catch (error) {
          toast.error("Error fetching commits");
        }
      }
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleHudi = async () => {
    setLoading(true);
    try {
      console.log("🚀 ~ handleHudi ~ selectedTable:", selectedTable);
      const hudi_table_path = selectedTable.split("/").slice(1).join("/");
      console.log("🚀 ~ handleHudi ~ hudi_table_path:", hudi_table_path);

      // const response = await apiClient.post("/hudi/key-metrics", {
      //   hudi_table_path: hudi_table_path,
      // });

      const response = await apiClient.post("/hudi/small-files-warning", {
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

  const handleIceberg = async () => {};

  useEffect(() => {
    const table = tableCred?.find((t) => t.path.includes(selectedTable));

    if (table) {
      const { type } = table;
      if (type === "DELTA") {
        setDataToShow(null); // Clear previous data
        handleDelta();
      } else if (type === "HUDI") {
        setDataToShow(null);
        handleHudi();
      } else if (type === "ICEBERG") {
        setDataToShow(null);
        handleIceberg();
      }
    }
  }, [selectedTable]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Key Metrics: {selectedTable}</h2>
      {dataToShow}
    </div>
  );
};

export default KeyMetrics;
