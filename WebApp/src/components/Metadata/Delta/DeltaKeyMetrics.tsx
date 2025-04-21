import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DeltaKeyMetricsProps {
  selectedTable: string;
}

const DeltaKeyMetrics = ({ selectedTable }: DeltaKeyMetricsProps) => {
  const [loading, setLoading] = useState(false);
  const [smallFileCnt, setSmallFileCnt] = useState(0);
  const [snapshotSizeData, setSnapshotSizeData] = useState<any[]>([]);
  const [commitMetrics, setCommitMetrics] = useState({
    numCommits: 0,
    numCheckpoints: 0,
    lastCommit: null as string | null,
    lastCheckpoint: null as string | null,
  });
  const [totalSnapshotSizeMB, setTotalSnapshotSizeMB] = useState(0);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchSmallFileProblem = async () => {
    setLoading(true);
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedTable}`;
      const smallFileProblemResponse = await apiClient.post(
        "/delta/smallFiles",
        {
          deltaDirectory: reqPath,
        }
      );
      console.log(
        "🚀 ~ fetchSmallFileProblem ~ smallFileProblemResponse:",
        smallFileProblemResponse.data
      );
      setSmallFileCnt(smallFileProblemResponse.data.noOfFiles);
    } catch (error) {
      toast.error("Failed to fetch small file problem.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitAndCheckpointMetrics = async () => {
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedTable}`;
      const commitRes = await apiClient.post("/delta/commits", {
        deltaDirectory: reqPath,
      });
      
      const lastCommitFile = commitRes.data.lastCommit || "";
      let commitNumber = -1;
      
      if (lastCommitFile) {
        try {
          const numberPart = lastCommitFile.replace(/^0+/, '').replace('.json', '');
          commitNumber = numberPart === '' ? 0 : parseInt(numberPart);
          if (isNaN(commitNumber)) {
            commitNumber = 0;
          }
        } catch (e) {
          commitNumber = 0;
        }
      }

      const checkpoints = (commitRes.data.checkpointFiles || [])
        .filter((file: string) => file.endsWith('.checkpoint.parquet'));

      setCommitMetrics({
        numCommits: commitNumber, 
        numCheckpoints: checkpoints.length,
        lastCommit: lastCommitFile,
        lastCheckpoint:
          checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null,
      });
    } catch (error) {
      toast.error("Failed to fetch commit/checkpoint metrics.");
    }
  };

  const fetchSnapshotSize = async () => {
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedTable}`;
      const snapshotSizeResponse = await apiClient.post("/delta/snapshotSize", {
        deltaDirectory: reqPath,
      });
      setSnapshotSizeData(snapshotSizeResponse.data.files);
      const totalKB = (snapshotSizeResponse.data.files || []).reduce(
        (acc: number, f: any) => acc + (f.sizeKB || 0),
        0
      );
      setTotalSnapshotSizeMB(parseFloat((totalKB / 1024).toFixed(2)));
    } catch (error) {
      toast.error("Failed to fetch snapshot size data.");
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const reqPath = `${trimmedBasePath}/${selectedTable}`;
      const smallFileDataResponse = await apiClient.post(
        "/delta/smallFilesCSV",
        {
          deltaDirectory: reqPath,
        },
        { responseType: "blob" }
      );
      console.log(
        "🚀 ~ handleDownloadCSV ~ smallFileDataResponse:",
        smallFileDataResponse
      );

      const filename =
        smallFileDataResponse.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "smallFiles.csv";

      const blob = new Blob([smallFileDataResponse.data], {
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
      toast.error("Failed to download CSV file.");
    }
  };

  const shortenPath = (fullPath: string) => {
    const segments = fullPath.split("/");
    let label = segments.length > 1 ? segments[1] : "";
    if (label.endsWith(".snappy.parquet")) {
      label = label.slice(0, -15);
    } else if (label.endsWith(".parquet")) {
      label = label.slice(0, -8);
    }
    return label.length > 17
      ? `${label.slice(0, 4)}...${label.slice(-10)}`
      : label;
  };

  const formatPathEnd = (path: string | null, maxLen = 18) => {
    if (!path) return "-";
    if (path.length <= maxLen) return path;
    return `...${path.slice(-maxLen)}`;
  };

  const formatCheckpointMultiline = (path: string | null, maxLen = 54) => {
    if (!path) return "-";
    if (path.length <= maxLen) return path;
    const short = path.slice(-maxLen);
    return short.replace(/(.{18})/g, "$1\n");
  };

  useEffect(() => {
    if (selectedTable) {
      fetchSmallFileProblem();
      fetchSnapshotSize();
      fetchCommitAndCheckpointMetrics();
    }
  }, [selectedTable]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const sortedSnapshotData = [...snapshotSizeData].sort(
    (a, b) =>
      new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
  );
  const chartData = sortedSnapshotData.map((file) => ({
    shortPath: shortenPath(file.path),
    sizeKB: file.sizeKB,
    fullPath: file.path,
  }));

  const MAX_POINTS = 20;
  let downsampledChartData = chartData;
  if (chartData.length > MAX_POINTS) {
    const step = Math.ceil(chartData.length / MAX_POINTS);
    downsampledChartData = chartData.filter((_, idx) => idx % step === 0);
    if (
      downsampledChartData[downsampledChartData.length - 1] !==
      chartData[chartData.length - 1]
    ) {
      downsampledChartData.push(chartData[chartData.length - 1]);
    }
  }

  const snapshotChartConfig = {
    sizeKB: {
      label: "Size (KB)",
      color: "var(--color-primary)",
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl mb-6 flex items-center gap-2">
        <TrendingUp className="w-8 h-8 text-blue-500" /> Delta Key Metrics:{" "}
        {selectedTable}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Commits</CardTitle>
          </CardHeader>
          <CardContent>{commitMetrics.numCommits + 1}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checkpoints</CardTitle>
          </CardHeader>
          <CardContent>{commitMetrics.numCheckpoints}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Commit</CardTitle>
          </CardHeader>
          <CardContent className="truncate">
            {formatPathEnd(commitMetrics.lastCommit)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Checkpoint</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-line text-xs break-all">
            {formatCheckpointMultiline(commitMetrics.lastCheckpoint)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Snapshot Size (MB)</CardTitle>
          </CardHeader>
          <CardContent>{totalSnapshotSizeMB}</CardContent>
        </Card>
      </div>
      {smallFileCnt > 0 ? (
        <Card className="bg-yellow-50 border-yellow-300">
          <CardHeader className="flex flex-row items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-1" />
            <div>
              <CardTitle className="text-yellow-700">
                Small File Problem Detected
              </CardTitle>
              <CardDescription>
                {smallFileCnt} small files detected in the table.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadCSV}>Download CSV</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-300">
          <CardHeader className="flex flex-row items-start gap-3">
            <CheckCircle className="text-green-600 mt-1" />
            <div>
              <CardTitle className="text-green-700">
                No Small File Issues
              </CardTitle>
              <CardDescription>
                You're good! No small file problem detected.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}
      {chartData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Snapshot Size Chart</h3>
          <ChartContainer config={snapshotChartConfig} className="h-[300px]">
            <LineChart data={downsampledChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="shortPath"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Size (KB)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                wrapperStyle={{
                  zIndex: 100,
                  position: "relative",
                  transform: "translateY(-50px)",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipContent indicator="dashed">
                        <div className="space-y-2 p-2">
                          <p className="text-sm font-medium break-all">
                            File: {data.fullPath}
                          </p>
                          <p className="text-xs">Size: {data.sizeKB} KB</p>
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="sizeKB"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default DeltaKeyMetrics;
