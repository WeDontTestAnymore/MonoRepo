import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, DatabaseZap } from "lucide-react";

interface IcebergTablePropertiesProps {
  selectedTable: string;
}

const IcebergTableProperties = ({
  selectedTable,
}: IcebergTablePropertiesProps) => {
  const [loading, setLoading] = useState(false);
  interface Snapshot {
    snapshot_id: string;
    timestamp_ms: string;
    added_rows_count: string;
    deleted_rows_count: string;
    existing_rows_count: string;
  }

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const icebergPath = `${basePath}/${selectedTable}`;
      const propertiesResponse = await apiClient.post(
        "/iceberg/snapshots/show",
        {
          icebergPath,
        }
      );
      console.log(
        "🚀 ~ fetchProperties ~ propertiesResponse:",
        propertiesResponse
      );

      setSnapshots(propertiesResponse.data.snapshots || []);
    } catch (error) {
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="w-1/2 h-1/2" />
      </div>
    );
  }

  const renderChange = (count: string, type: "added" | "deleted") => {
    const value = parseInt(count);
    if (value === 0) return <span className="text-muted-foreground">0</span>;
    const Icon = type === "added" ? ArrowUpRight : ArrowDownRight;
    const color = type === "added" ? "text-green-500" : "text-red-500";
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon size={14} /> {value}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <DatabaseZap className="h-5 w-5 text-primary" />
        Snapshot History for{" "}
        <span className="text-primary">{selectedTable}</span>
      </h2>

      {loading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : snapshots.length === 0 ? (
        <p className="text-muted-foreground">No snapshots available</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snapshot ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Added Rows</TableHead>
                <TableHead>Deleted Rows</TableHead>
                <TableHead>Existing Rows</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snap) => (
                <TableRow key={snap.snapshot_id}>
                  <TableCell>{snap.snapshot_id}</TableCell>
                  <TableCell>{snap.timestamp_ms}</TableCell>
                  <TableCell>
                    {renderChange(snap.added_rows_count, "added")}
                  </TableCell>
                  <TableCell>
                    {renderChange(snap.deleted_rows_count, "deleted")}
                  </TableCell>
                  <TableCell>{snap.existing_rows_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IcebergTableProperties;
