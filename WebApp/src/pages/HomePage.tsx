import Navbar from "@/components/Home/Navbar";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import FeaturesSection from "@/components/Home/FeatureSection";
import ProcessingIllustration from "@/components/Home/ProcessingIllustration";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Header Section */}
      <div className="pt-28 w-full flex justify-center my-8 px-10">
        <Header />
      </div>

      {/* Processing Illustration with Trino Info */}
      <div className="w-full flex justify-center my-8 px-20">
        <div className="w-2/3 flex justify-center">
          <ProcessingIllustration />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="w-full flex justify-center mt-8 mb-32">
        <FeaturesSection />
      </div>

      {/* Footer */}
      <div className="w-full flex justify-center mt-10">
        <Footer />
      </div>
    </div>
  );
}
