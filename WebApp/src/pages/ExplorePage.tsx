import NavbarAuthenticated from "@/components/Explore/NavbarAuthenticated";
import CloudProviderForm from "@/components/Explore/CloudProviderForm";
import PreviouslyAccessed from "@/components/Explore/PreviouslyAccessed";
import Footer from "@/components/Home/Footer";

const ExplorePage = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 mt-12">
      <NavbarAuthenticated />
      <div className="w-full pt-20">
        <CloudProviderForm />
      </div>
      <PreviouslyAccessed />
      <Footer />
    </div>
  );
};

export default ExplorePage;
