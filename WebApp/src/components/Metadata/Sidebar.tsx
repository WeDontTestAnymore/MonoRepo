import React, { JSX } from "react";
import { File, Folder, Tree } from "../magicui/file-tree";
import { Link } from "react-router-dom";
import { Database } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LeftToRightListBulletIcon,
  InformationSquareIcon,
  GitCompareIcon,
  PresentationBarChart01Icon,
  Structure03Icon,
  CodeIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

interface SidebarProps {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  setActiveSection: (section: string) => void;
  availableTables: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedTable,
  setSelectedTable,
  setActiveSection,
  availableTables,
}) => {
  const tableCred = useSelector(
    (state: RootState) => state.tableCred.tableCred
  );

  const getTableType = (tableName: string) => {
    const table = tableCred?.find((table) => table.path.includes(tableName));
    return table ? table.type : "unknown";
  };
  interface Element {
    id: string;
    isSelectable?: boolean;
    name: string;
    icon?: JSX.Element;
    children?: Element[];
  }

  const ELEMENTS: Element[] = [
    {
      id: "1",
      isSelectable: false,
      name: "Tables",
      children: [
        ...availableTables.map((tableName, index) => ({
          id: `${index + 2}`,
          isSelectable: true,
          name: tableName,
          children: [
            {
              id: `schemas-${tableName}`,
              name: "Schemas",
              icon: (
                <HugeiconsIcon
                  icon={LeftToRightListBulletIcon}
                  className="w-5 h-5 mr-2 text-white"
                />
              ),
            },
            {
              id: `properties-${tableName}`,
              name: "Properties",
              icon: (
                <HugeiconsIcon
                  icon={InformationSquareIcon}
                  className="w-5 h-5 mr-2 text-white"
                />
              ),
            },
            {
              id: `versioning-${tableName}`,
              name: "Versioning & Snapshots",
              icon: (
                <HugeiconsIcon
                  icon={GitCompareIcon}
                  className="w-5 h-5 mr-2 text-white"
                />
              ),
            },
            {
              id: `metrics-${tableName}`,
              name: "Key Metrics",
              icon: (
                <HugeiconsIcon
                  icon={PresentationBarChart01Icon}
                  className="w-5 h-5 mr-2 text-white"
                />
              ),
            },
          ],
        })),
        {
          id: "schema-viewer",
          isSelectable: true,
          name: "Schema Viewer",
          icon: (
            <HugeiconsIcon
              icon={Structure03Icon}
              className="w-5 h-5 mr-2 text-white"
            />
          ),
        },
      ],
    },
    {
      id: "execute-sql",
      isSelectable: false,
      name: "Execute SQL",
      icon: <Database className="w-4 h-4 mr-2 text-gray-400" />,
      children: [
        {
          id: "run-sql",
          name: "Run Query",
          icon: (
            <HugeiconsIcon
              icon={CodeIcon}
              className="w-5 h-5 mr-2 text-white"
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="w-75 bg-[#070606] text-white p-4 flex flex-col h-screen">
      {/* App Title */}
      <div className="text-2xl font-bold text-white text-center pb-4 border-b border-[#979595] flex items-center justify-center gap-2">
        <Link to="/" className="tektur-font">
          MetaLens
        </Link>
      </div>

      {/* Sidebar Tree */}
      <div className="flex-grow overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-[#3A3A3A] scroll-smooth">
        <Tree
          className="text-gray-300 titillium-web-semibold"
          initialSelectedId="2"
          initialExpandedItems={["1", "execute-sql"]}
          elements={ELEMENTS}
          openIcon={
            <HugeiconsIcon
              icon={PackageIcon}
              className="w-5 h-5 mr-2 text-white"
            />
          }
          closeIcon={
            <HugeiconsIcon
              icon={PackageIcon}
              className="w-5 h-5 mr-2 text-white"
            />
          }
        >
          {/* Tables Section */}
          <Folder
            element="Tables"
            value="1"
            className="p-1 text-lg titillium-web-semibold"
          >
            {availableTables.map((tableName, index) => {
              const tableType = getTableType(tableName);

              if (tableType === "PARQUET") {
                console.log("Table Type: ", tableType);
                return (
                  <File
                    key={`parquet-${tableName}`}
                    value={`parquet-${tableName}`}
                    className="p-2 pl-6 rounded-lg transition titillium-web-regular hover:bg-[#3A3A3A]"
                    fileIcon={
                      <HugeiconsIcon
                        icon={PackageIcon}
                        className="w-5 h-5 mr-2 text-white"
                      />
                    }
                    onClick={() => {
                      setSelectedTable(tableName);
                      setActiveSection(`ParquetItIs`);
                      console.log("YES");
                    }}
                  >
                    {tableName} (Parquet)
                  </File>
                );
              }

              return (
                <Folder
                  key={tableName}
                  value={tableName}
                  element={tableName}
                  className={`p-2 rounded-lg transition text-md ${
                    selectedTable === tableName
                      ? "bg-[#2C2C2C] text-white titillium-web-semibold"
                      : "hover:bg-[#3A3A3A]"
                  }`}
                  onClick={() => setSelectedTable(tableName)}
                >
                  {Array.isArray(ELEMENTS[0].children?.[index]?.children) &&
                    ELEMENTS[0].children?.[index]?.children?.map((option) => (
                      <File
                        key={option.id}
                        value={option.id}
                        className={`p-2 pl-6 rounded-lg transition titillium-web-regular ${
                          option.name === selectedTable
                            ? "bg-[#2C2C2C] text-white font-bold"
                            : "hover:bg-[#3A3A3A]"
                        }`}
                        onClick={() => setActiveSection(option.name)}
                        fileIcon={option.icon}
                      >
                        {option.name}
                      </File>
                    ))}
                </Folder>
              );
            })}

            {/* Schema Viewer */}
            <File
              key="schema-viewer"
              value="schema-viewer"
              className="p-2 rounded-lg transition hover:bg-[#3A3A3A] titillium-web-regular"
              fileIcon={
                <HugeiconsIcon
                  icon={Structure03Icon}
                  className="w-5 h-5 mr-2 text-white"
                />
              }
              onClick={() => setActiveSection("Schema Viewer")}
            >
              Schema Viewer
            </File>
          </Folder>

          {/* Execute SQL Section */}
          <Folder
            element="Execute SQL"
            value="execute-sql"
            className="p-1 text-lg"
          >
            <File
              key="run-sql"
              value="run-sql"
              className="p-2 rounded-lg transition hover:bg-[#3A3A3A]"
              fileIcon={
                <HugeiconsIcon
                  icon={CodeIcon}
                  className="w-5 h-5 mr-2 text-white"
                />
              }
              onClick={() => setActiveSection("Run Query")}
            >
              Run Query
            </File>
          </Folder>
        </Tree>
      </div>
    </div>
  );
};

export default Sidebar;
