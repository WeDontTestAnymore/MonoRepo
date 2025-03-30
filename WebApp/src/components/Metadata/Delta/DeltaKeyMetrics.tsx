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

interface DeltaKeyMetricsProps {
  selectedTable: string;
}

const DeltaKeyMetrics = ({ selectedTable }: DeltaKeyMetricsProps) => {
  const [loading, setLoading] = useState(false);
  const basePath = useSelector((state: RootState) => state.tableCred.basePath);
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

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
      fetchStats(latestCommit.path);
    } catch (error) {
      toast.error("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (commitPath: string) => {
    setLoading(true);
    try {
      const statsResponse = await apiClient.post("/delta/stats", {
        fileDirectory: `${basePath}/${commitPath}`,
      });

      setStats(JSON.parse(statsResponse.data.stats));
    } catch (error) {
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) fetchCommits(selectedTable);
  }, [selectedTable]);

  return (
    <div>
      <h2 className="text-lg font-semibold">
        Delta Key Metrics - {selectedTable}
      </h2>

      {/* Commit Selector Dropdown */}
      {commits.length > 0 && (
        <Select
          value={selectedCommit || ""}
          onValueChange={(val) => {
            setSelectedCommit(val);
            const commit = commits.find((c) => c.fileName === val);
            if (commit) fetchStats(commit.path);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Commit" />
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        stats && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <h3 className="font-semibold text-md">Stats</h3>
            <p>
              <strong>Records:</strong> {stats.numRecords}
            </p>
            <p>
              <strong>Min Age:</strong> {stats.minValues?.age ?? "N/A"}
            </p>
            <p>
              <strong>Max Age:</strong> {stats.maxValues?.age ?? "N/A"}
            </p>
            <p>
              <strong>Min User:</strong> {stats.minValues?.userid ?? "N/A"}
            </p>
            <p>
              <strong>Max User:</strong> {stats.maxValues?.userid ?? "N/A"}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default DeltaKeyMetrics;
