import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import s3Bucket from "@/assets/s3Bucket.png";
import azureBlob from "@/assets/azureBlob.png";
import minIo from "@/assets/minIo.png";
import cloudFlare from "@/assets/cloudflare.png";

// Dummy bucket data
const dummyBuckets = [
  { id: "1", name: "aws-bucket-123", provider: "AWS", logo: s3Bucket },
  { id: "2", name: "azure-storage", provider: "Azure", logo: azureBlob },
  {
    id: "3",
    name: "cloudflare-r2-data",
    provider: "Cloudflare",
    logo: cloudFlare,
  },
  { id: "4", name: "custom-minio-bucket", provider: "Custom", logo: minIo },
  { id: "5", name: "backup-bucket", provider: "AWS", logo: s3Bucket },
  { id: "6", name: "data-store", provider: "Azure", logo: azureBlob },
];

export default function PreviousBuckets() {
  return (
    <div className="w-full max-w-6xl px-6 mt-6">
      <h2 className="text-md font-semibold text-gray-800 mb-4 titillium-web-regular">
        Previously Accessed Buckets
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyBuckets.map((bucket, index) => (
          <motion.div
            key={bucket.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-4 flex items-center justify-between shadow-md hover:shadow-lg transition duration-200">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <img
                  src={bucket.logo}
                  alt={bucket.name}
                  className="h-8 w-8 flex-shrink-0"
                />
                <span className="roboto-mono-font text-gray-700 text-sm truncate w-full">
                  {bucket.name}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
