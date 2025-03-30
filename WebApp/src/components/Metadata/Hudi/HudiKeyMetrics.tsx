import { useEffect, useState } from "react";
import apiClient from "@/services/axios.config";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HudiKeyMetricsProps {
  selectedTable: string;
}

const HudiKeyMetrics = ({ selectedTable }: HudiKeyMetricsProps) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [smallFileWarning, setSmallFileWarning] = useState<any>(null);

  const fetchHudiKeyMetrics = async (tableName: string) => {
    const hudi_table_path = tableName.replace(/^\/+/, "");

    try {
      const metricsResponse = await apiClient.post("/hudi/key-metrics", {
        hudi_table_path,
      });

      if (metricsResponse.status === 200) {
        setMetrics(metricsResponse.data);

        const smallFileProblemResponse = await apiClient.post(
          "/hudi/small-files-warning",
          { hudi_table_path }
        );

        if (smallFileProblemResponse.status === 200) {
          setSmallFileWarning(smallFileProblemResponse.data);

          if (smallFileProblemResponse.data.total_small_files > 0) {
            toast.warning("Small file issue detected!");
          }
        } else {
          toast.error("Failed to fetch small file problem data.");
        }
      }
    } catch (error) {
      console.error("Error fetching Hudi table metrics:", error);
      toast.error("Error fetching Hudi table metrics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      setLoading(true);
      fetchHudiKeyMetrics(selectedTable);
    }
  }, [selectedTable]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl mb-4 font-semibold text-gray-800">
        Hudi Key Metrics: {selectedTable}
      </h2>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle>Source</CardTitle>
            </CardHeader>
            <CardContent>{metrics.source}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Rows</CardTitle>
            </CardHeader>
            <CardContent>{metrics.total_rows}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Columns</CardTitle>
            </CardHeader>
            <CardContent>{metrics.total_columns}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Size (MB)</CardTitle>
            </CardHeader>
            <CardContent>{metrics.file_size_mb.toFixed(2)}</CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>File Used</CardTitle>
            </CardHeader>
            <CardContent className="truncate">{metrics.file_used}</CardContent>
          </Card>
        </div>
      )}

      {smallFileWarning?.total_small_files > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Warning: Small File Problem</AlertTitle>
          <AlertDescription>
            {smallFileWarning.total_small_files} small files detected. **Total
            Small Size:** {smallFileWarning.total_small_size_MB.toFixed(2)} MB
            This may impact query performance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HudiKeyMetrics;
