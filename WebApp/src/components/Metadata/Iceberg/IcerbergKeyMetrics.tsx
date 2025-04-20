import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IcebergKeyMetricsProps {
  selectedTable: string;
}

const IcerbergKeyMetrics = ({ selectedTable }: IcebergKeyMetricsProps) => {
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [overheadCnt, setOverheadCnt] = useState(0);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchKeyMetrics = async () => {
    setLoading(true);
    try {
      const icebergPath = `${basePath}/${selectedTable}`;
      const keyMetricsResponse = await apiClient.post(
        "/iceberg/keyMetrics/fileData",
        {
          icebergPath,
        }
      );
      console.log(
        "🚀 ~ fetchKeyMetrics ~ keyMetricsResponse:",
        keyMetricsResponse.data.fileData
      );

      if (
        keyMetricsResponse.status === 200 &&
        keyMetricsResponse.data?.fileData
      ) {
        setFileData(keyMetricsResponse.data.fileData); // Fixed incorrect data access

        const overheadCntResponse = await apiClient.post(
          "/iceberg/keyMetrics/overhead",
          { icebergPath }
        );
        console.log(
          "🚀 ~ fetchKeyMetrics ~ overheadCntResponse:",
          overheadCntResponse
        );
        if (overheadCntResponse.status === 200) {
          setOverheadCnt(overheadCntResponse.data.noOfFiles);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch key metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOverhead = async () => {
    try {
      const icebergPath = `${basePath}/${selectedTable}`;
      const response = await apiClient.post(
        "/iceberg/keyMetrics/overheadCSV",
        { icebergPath },
        { responseType: "blob" } // Treat response as file
      );

      const filename =
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "overhead.csv";

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Overhead data downloaded");
    } catch (error) {
      toast.error("Error downloading data. Please try again later.");
    }
  };

  const chartData = fileData.map((item) => {
    const partitionKey = item.partition
      ? Object.keys(item.partition)[0]
      : "partition";
    const partitionValue = item.partition
      ? item.partition[partitionKey]
      : "unpartitioned";

    return {
      partitionKey,
      partitionValue: String(partitionValue),
      rowCount: Number.parseInt(item.row_count),
      sizeBytes: Number.parseInt(item.size_bytes),
      formattedSize: `${(Number.parseInt(item.size_bytes) / 1024).toFixed(
        2
      )} KB`,
    };
  });

  const totalRowCount = fileData.reduce(
    (sum, item) => sum + Number(item.row_count || 0),
    0
  );
  const totalSize = fileData.reduce(
    (sum, item) => sum + Number(item.size_bytes || 0),
    0
  );

  const chartConfig = {
    rowCount: {
      label: "Row Count",
      color: "hsl(var(--chart-1))",
    },
    sizeBytes: {
      label: "Size (bytes)",
      color: "hsl(var(--chart-2))",
      hidden: true,
    },
  };

  useEffect(() => {
    fetchKeyMetrics();
  }, []);

  const isUnpartitioned = fileData.length > 0 && fileData[0].partition === null;

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Iceberg Table Metrics</CardTitle>
          <CardDescription>
            {selectedTable} -{" "}
            {isUnpartitioned
              ? "Unpartitioned Table"
              : `Partitions by ${chartData[0]?.partitionKey}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : isUnpartitioned ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{totalRowCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {(totalSize / 1024).toFixed(2)} KB
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : fileData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="partitionValue"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent indicator="dashed">
                          <div className="space-y-2 p-2">
                            <p className="text-sm font-medium">
                              {data.partitionKey}: {data.partitionValue}
                            </p>
                            <p className="text-xs">
                              Row Count: {data.rowCount}
                            </p>
                            <p className="text-xs">
                              Size: {data.formattedSize}
                            </p>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="rowCount"
                  fill="var(--color-rowCount)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {overheadCnt > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-700" />
            <span>Overhead Warning: Number of small files = {overheadCnt}</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleDownloadOverhead}>
            <Download className="mr-2 h-4 w-4" />
            Download Overhead Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default IcerbergKeyMetrics;
