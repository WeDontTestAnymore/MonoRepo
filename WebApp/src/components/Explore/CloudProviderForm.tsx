import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Globe, Folder, Key, Link } from "lucide-react"; // Icons
import s3Bucket from "@/assets/s3Bucket.png";
import azureBlob from "@/assets/azureBlob.png";
import minIo from "@/assets/minIo.png";
import cloudFlare from "@/assets/cloudflare.png";
import { useNavigate } from "react-router-dom";
import { MultiStepLoader } from "../ui/multi-step-loader"; // Loader Component
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";

const cloudProviders = [
  { id: "aws", name: "AWS", logo: s3Bucket },
  { id: "azure", name: "Azure", logo: azureBlob },
  { id: "cloudflare", name: "Cloudflare R2", logo: cloudFlare },
  { id: "custom", name: "Custom", logo: minIo },
];

export default function CloudProviderForm() {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [s3Path, setS3Path] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [region, setRegion] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [loading, setLoading] = useState(false); // Manage loader state
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Start the loading process
    setLoading(true);

    // Simulate loading steps before navigation
    setTimeout(() => {
      setLoading(false); // Stop loading once done
      navigate(`/metadata?s3Path=${encodeURIComponent(s3Path)}`);
    }, 6000); // Simulate loading for 5 seconds
  };

  const loadingStates = [
    { text: "Warming up the engines..." },
    { text: "Syncing with the cloud..." },
    { text: "Digging through data..." },
    { text: "Crafting the perfect schema..." },
    { text: "Polishing metadata..." },
    { text: "Initializing Trino Query Engine..." },
    { text: "Connecting to Distributed Workers..." },
    { text: "Optimizing Query Execution Plans..." },
    { text: "Unleashing the power of analytics..." },
    { text: "Ready to explore!" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-6">
      {/* Cloud Provider Badges */}
      <div className="flex gap-3 mb-4 flex-nowrap overflow-hidden">
        {cloudProviders.map((provider) => (
          <Badge
            key={provider.id}
            className={`titillium-web-regular px-3 py-2 text-base border cursor-pointer flex items-center gap-2 shadow-sm rounded-lg whitespace-nowrap
              ${
                selectedProvider === provider.id
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              }`}
            onClick={() => setSelectedProvider(provider.id)}
            style={{
              ...(selectedProvider === provider.id && {
                pointerEvents: "none",
              }),
            }}
          >
            <img src={provider.logo} alt={provider.name} className="h-6 w-6" />
            {provider.name}
          </Badge>
        ))}
      </div>

      {/* Input Fields with Properly Aligned Icons */}
      <div className="titillium-web-regular grid grid-cols-2 gap-4">
        {selectedProvider === "custom" && (
          <div className="relative">
            <Link
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <Input
              placeholder="Enter S3-Compatible Storage URL"
              value={s3Path}
              onChange={(e) => setS3Path(e.target.value)}
              className="shadow-md rounded-lg pl-12"
            />
          </div>
        )}
        <div className="relative">
          <Folder
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <Input
            placeholder="Bucket Name"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            className="shadow-md rounded-lg pl-12"
          />
        </div>
        <div className="relative">
          <Globe
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <Input
            placeholder="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="shadow-md rounded-lg pl-12"
          />
        </div>
        <div className="relative">
          <Key
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <Input
            placeholder="Access Key ID"
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
            className="shadow-md rounded-lg pl-12"
          />
        </div>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <Input
            placeholder="Secret Access Key"
            type="password"
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            className="shadow-md rounded-lg pl-12"
          />
        </div>
      </div>

      {/* Explore Button */}
      <div className="titillium-web-regular flex justify-center mt-6">
        <InteractiveHoverButton onClick={handleSubmit}>
          Explore Metadata
        </InteractiveHoverButton>
      </div>

      {/* Loader Component */}
      {loading && (
        <div className="roboto-mono-font fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-white bg-opacity-80">
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={loading}
            duration={500}
            loop={false}
          />
        </div>
      )}
    </div>
  );
}
