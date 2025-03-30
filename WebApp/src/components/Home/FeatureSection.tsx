import { Timeline } from "../ui/timeline";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SchemeIcon,
  SqlIcon,
  GitCompareIcon,
  CloudSavingDone01Icon,
} from "@hugeicons/core-free-icons";

const features = [
  {
    title: "Cloud Storage Integration",
    description:
      "Seamlessly connect AWS S3, Azure Blob, Cloudflare R2, and Minio. Secure authentication with API keys and easy metadata extraction.",
    icon: <HugeiconsIcon icon={CloudSavingDone01Icon} size={60} />,
  },
  {
    title: "Intuitive Schema Explorer",
    description:
      "Easily navigate database schemas, view table structures, and analyze relationships. Integrated with dbdocs.io for interactive schema visualization.",
    icon: <HugeiconsIcon icon={SchemeIcon} size={60} />,
  },
  {
    title: "Versioning & Snapshots",
    description:
      "Compare schema versions, track changes, and manage historical snapshots. Visual indicators highlight added, modified, and removed fields.",
    icon: <HugeiconsIcon icon={GitCompareIcon} size={60} />,
  },
  {
    title: "Query Builder (No-Code SQL)",
    description:
      "Supports joins, nested queries, and SQL editor for manual modifications. Optimize query execution with pruning efficiency for faster performance.",
    icon: <HugeiconsIcon icon={SqlIcon} size={60} />,
  },
];

const timelineData = features.map((f) => ({
  title: f.title,
  content: (
    <div className="flex items-center">
      <div className="w-3/4 pr-4">
        <p className="text-neutral-800 dark:text-neutral-200 justify-center text-sm md:text-base font-normal">
          {f.description}
        </p>
      </div>
      <div className="w-1/4 flex justify-center">{f.icon}</div>
    </div>
  ),
}));

export default function FeaturesSection() {
  return <Timeline data={timelineData} />;
}
