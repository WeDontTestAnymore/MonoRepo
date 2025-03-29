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
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const dispatch = useDispatch<AppDispatch>();

  const handleDelta = async () => {
    setLoading(true);
    try {
      if (!allCommits.length) {
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
      } else {
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
      }
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleHudi = async () => {};

  const handleIceberg = async () => {};

  useEffect(() => {
    const table = tableCred?.find((t) => t.path.includes(selectedTable));

    if (table) {
      const { type } = table;
      if (type === "DELTA") {
        handleDelta();
      } else if (type === "HUDI") {
        handleHudi();
      } else if (type === "ICEBERG") {
        handleIceberg();
      }
    }
  }, [selectedTable]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Table Schema: {selectedTable}</h2>
      {dataToShow}
    </div>
  );
};

export default KeyMetrics;
