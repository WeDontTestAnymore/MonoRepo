import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import apiClient from "@/services/axios.config";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, FilePlus, History, Table as TableIcon } from "lucide-react";
import { format } from "date-fns";

interface DeltaTablePropertiesProps {
  selectedTable: string;
}

const DeltaTableProperties = ({ selectedTable }: DeltaTablePropertiesProps) => {
  const [loading, setLoading] = useState(false);
  const [commitId, setCommitId] = useState<string | null>(null);
  const [commitResponse, setCommitResponse] = useState<any[]>([]);

  const basePath = useSelector((state: RootState) => state.tableCred.basePath);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const trimmedBasePath =
        basePath && basePath.startsWith("s3://")
          ? basePath.slice(5)
          : basePath || "";
      const commitName = commitId;
      const paddedCommitId = commitName ? commitName.padStart(20, "0") : null;
      const reqPath = `${trimmedBasePath}/${selectedTable}/_delta_log/${paddedCommitId}.json`;
      console.log("🚀 ~ fetchDetails ~ reqPath:", reqPath);
      const detailResponse = await apiClient.post("/delta/details", {
        commitFilePath: reqPath,
      });
      console.log("🚀 ~ fetchDetails ~ detailResponse:", detailResponse.data);
      setCommitResponse(detailResponse.data.changes);
    } catch (error) {
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-gray-100">
      <h2 className="text-3xl mb-2 flex items-center gap-2">
        <History className="w-8 h-8 text-blue-500" /> Delta Commit Properties: {selectedTable}
      </h2>

      <div className="flex gap-2 items-center shrink-0">
        <Input
          type="text"
          placeholder="Enter Commit ID"
          value={commitId || ""}
          onChange={(e) => setCommitId(e.target.value)}
          className="w-[300px]"
        />
        <Button onClick={fetchDetails} disabled={loading}>
          {loading ? "Loading..." : "Fetch Details"}
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full rounded-md border p-4">
          {commitResponse.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data to display.</p>
          ) : (
            commitResponse.map((item, idx) => {
              const isMeta = item.type === "metaData";
              const isAdd = item.type === "add";

              return (
                <Collapsible key={idx}>
                  <Card className="mb-4">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="flex items-center justify-between cursor-pointer hover:bg-muted rounded-md transition-colors p-4">
                        <div className="flex items-center gap-2">
                          {isMeta ? (
                            <TableIcon className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <FilePlus className="w-5 h-5 text-muted-foreground" />
                          )}
                          <CardTitle>
                            {isMeta ? "MetaData" : "File Added"} –{" "}
                            {isMeta
                              ? format(new Date(item.createdTime), "PPpp")
                              : `${item.size} bytes`}
                          </CardTitle>
                        </div>
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-3">
                        {isMeta && (
                          <>
                            <p>
                              <strong>Format Provider:</strong>{" "}
                              {item.format.provider}
                            </p>
                            <p>
                              <strong>Partition Columns:</strong>{" "}
                              {item.partitionColumns?.join(", ") || "None"}
                            </p>
                            <div>
                              <strong>Schema Fields:</strong>
                              <ul className="ml-4 list-disc">
                                {JSON.parse(item.schemaString).fields.map(
                                  (f: any, i: number) => (
                                    <li key={i}>
                                      <code>{f.name}</code>: {f.type}{" "}
                                      {f.nullable ? "(nullable)" : "(not null)"}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </>
                        )}

                        {isAdd && (
                          <>
                            <p>
                              <strong>Path:</strong> {item.path}
                            </p>
                            <p>
                              <strong>Modification Time:</strong>{" "}
                              {format(new Date(item.modificationTime), "PPpp")}
                            </p>
                            <div>
                              <strong>Partition Values:</strong>
                              <ul className="ml-4 list-disc">
                                {Object.entries(item.partitionValues || {}).map(
                                  ([key, val]) => (
                                    <li key={key}>
                                      {key}: {String(val)}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div>
                              <strong>Stats:</strong>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Min</TableHead>
                                    <TableHead>Max</TableHead>
                                    <TableHead>Null Count</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.keys(item.stats?.minValues || {}).map(
                                    (field) => (
                                      <TableRow key={field}>
                                        <TableCell>{field}</TableCell>
                                        <TableCell>
                                          {item.stats.minValues[field]}
                                        </TableCell>
                                        <TableCell>
                                          {item.stats.maxValues[field]}
                                        </TableCell>
                                        <TableCell>
                                          {item.stats.nullCount[field]}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DeltaTableProperties;
