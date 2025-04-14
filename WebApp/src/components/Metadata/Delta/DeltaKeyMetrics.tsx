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
import { AlertTriangle, CheckCircle } from "lucide-react";

interface DeltaKeyMetricsProps {
  selectedTable: string;
}

const DeltaKeyMetrics = ({ selectedTable }: DeltaKeyMetricsProps) => {
  const [loading, setLoading] = useState(false);
  const [smallFileCnt, setSmallFileCnt] = useState(0);

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

  useEffect(() => {
    if (selectedTable) fetchSmallFileProblem();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-6">
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
    </div>
  );
};

export default DeltaKeyMetrics;
