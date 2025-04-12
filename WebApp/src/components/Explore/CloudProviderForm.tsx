import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Globe, Folder, Key, Link } from "lucide-react"; // Icons
import s3Bucket from "@/assets/s3Bucket.png";
import azureBlob from "@/assets/azureBlob.png";
import minIo from "@/assets/minIo.png";
import { useNavigate } from "react-router-dom";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";
import { MultiStepLoader } from "../ui/multi-step-loader"; // Loader Component
import apiClient from "@/services/axios.config";
import { toast } from "sonner";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { setTableCred } from "@/contexts/tableCred.slice";
import { setBasePath } from "@/contexts/tableCred.slice";

const cloudProviders = [
  { id: "AWS", name: "AWS", logo: s3Bucket },
  { id: "Azure", name: "Azure", logo: azureBlob },
  { id: "Other", name: "Custom", logo: minIo },
];

const validationSchema = Yup.object({
  selectedProvider: Yup.string().required("Please select a provider"),
  s3Path: Yup.string().when("selectedProvider", {
    is: "custom",
    then: (schema) => schema.required("S3-Compatible Storage URL is required"),
  }),
  bucketName: Yup.string().required("Bucket Name is required"),
  region: Yup.string().required("Region is required"),
  accessKeyId: Yup.string().required("Access Key ID is required"),
  secretAccessKey: Yup.string().required("Secret Access Key is required"),
});

export default function CloudProviderForm() {
  const [loading, setLoading] = useState(false); // Manage loader state
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: any) => {
    setLoading(true);

    const payload = {
      bucket_name: values.bucketName,
      bucket_region: values.region,
      bucket_type:
        values.selectedProvider === "Other" ? "Other" : values.selectedProvider,
      bucket_uri: values.s3Path || "",
      bucket_access_key_id: values.accessKeyId,
      bucket_secret_access_key: values.secretAccessKey,
    };

    try {
      // Step 1: Authenticate/Login
      const response = await apiClient.post("/auth/login", payload);
      console.log("Login Response:", response.data);
      console.log("Login Status:", response.status);

      if (response.status === 200) {
        toast.success("Login successful!");

        // Step 2: Fetch metadata from bucket
        const metadataResponse = await apiClient.post("/bucket/scan");

        console.log("Metadata Response:", metadataResponse.data);

        if (metadataResponse.status === 200 && metadataResponse.data.tables) {
          // Step 3: Store metadata in Redux
          dispatch(setTableCred(metadataResponse.data.tables));

          console.log(metadataResponse.data.tables);

          const extractedBasePath = metadataResponse.data.basePath;

          // // Extract base path (e.g., "s3://datalake")
          // const firstPath = metadataResponse.data.tables[0]?.path || "";
          // console.log("🚀 ~ handleSubmit ~ firstPath:", firstPath);
          // const extractedBasePath = firstPath.split("/").slice(0, 3).join("/");
          console.log(
            "🚀 ~ handleSubmit ~ extractedBasePath:",
            extractedBasePath
          );

          dispatch(setBasePath(extractedBasePath)); // Store base path in Redux

          // Step 4: Navigate to metadata page
          navigate("/metadata");
        } else {
          toast.error("Failed to fetch metadata.");
        }
      } else {
        toast.error("Login failed. Please check credentials.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred!");
    } finally {
      setLoading(false);
    }
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
    <Formik
      initialValues={{
        selectedProvider: "",
        s3Path: "",
        bucketName: "",
        region: "",
        accessKeyId: "",
        secretAccessKey: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-6">
          {/* Cloud Provider Selection (Formik Managed) */}
          <div className="flex gap-3 mb-4 flex-nowrap overflow-hidden">
            {cloudProviders.map((provider) => (
              <Badge
                key={provider.id}
                className={`titillium-web-regular px-3 py-2 text-base border cursor-pointer flex items-center gap-2 shadow-sm rounded-lg whitespace-nowrap
                  ${
                    values.selectedProvider === provider.id
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                  }`}
                onClick={() => setFieldValue("selectedProvider", provider.id)}
                style={{
                  ...(values.selectedProvider === provider.id && {
                    pointerEvents: "none",
                  }),
                }}
              >
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="h-6 w-6"
                />
                {provider.name}
              </Badge>
            ))}
          </div>
          <ErrorMessage
            name="selectedProvider"
            component="div"
            className="text-red-500"
          />

          {/* Input Fields */}
          <div className="titillium-web-regular grid grid-cols-2 gap-4">
            {values.selectedProvider === "Other" && (
              <div className="relative">
                <Link
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <Field
                  as={Input}
                  name="s3Path"
                  placeholder="Enter S3-Compatible Storage URL"
                  className="shadow-md rounded-lg pl-12"
                />
                <ErrorMessage
                  name="s3Path"
                  component="div"
                  className="text-red-500"
                />
              </div>
            )}
            <div className="relative">
              <Folder
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Field
                as={Input}
                name="bucketName"
                placeholder="Bucket Name"
                className="shadow-md rounded-lg pl-12"
              />
              <ErrorMessage
                name="bucketName"
                component="div"
                className="text-red-500"
              />
            </div>
            <div className="relative">
              <Globe
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Field
                as={Input}
                name="region"
                placeholder="Region"
                className="shadow-md rounded-lg pl-12"
              />
              <ErrorMessage
                name="region"
                component="div"
                className="text-red-500"
              />
            </div>
            <div className="relative">
              <Key
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Field
                as={Input}
                name="accessKeyId"
                placeholder="Access Key ID"
                className="shadow-md rounded-lg pl-12"
              />
              <ErrorMessage
                name="accessKeyId"
                component="div"
                className="text-red-500"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <Field
                as={Input}
                name="secretAccessKey"
                type="password"
                placeholder="Secret Access Key"
                className="shadow-md rounded-lg pl-12"
              />
              <ErrorMessage
                name="secretAccessKey"
                component="div"
                className="text-red-500"
              />
            </div>
          </div>

          {/* Explore Button */}
          <div className="titillium-web-regular flex justify-center mt-6">
            <InteractiveHoverButton type="submit">
              Explore Metadata
            </InteractiveHoverButton>
          </div>

          {/* Loader Component */}
          {loading && (
            <div className="roboto-mono-font fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-white bg-opacity-80">
              <MultiStepLoader
                loadingStates={loadingStates}
                loading={loading}
                duration={200}
                loop={false}
              />
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}
