import { useState } from "react";
import { Button } from "@/components/ui/button"; // ShadCN Button
import { User, Menu, Moon, Sun } from "lucide-react"; // ShadCN Lucide Icons
import { ScrollProgress } from "../magicui/scroll-progress";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "@/contexts/theme.slice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.theme); // Get theme state
  const dispatch = useDispatch();

  // Function to handle smooth scrolling
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false); // Close menu on mobile after click
    }
  };

  // Toggle the theme between light and dark
  const handleThemeToggle = () => {
    dispatch(toggleTheme()); // Dispatch toggle theme action
  };

  // Set classes based on the current theme
  const hoverClasses =
    theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600";

  return (
    <nav
      className={`w-full fixed top-0 left-0 right-0 z-50 ${
        theme === "dark"
          ? "bg-gradient-to-r from-black via-gray-900 to-black text-white"
          : "bg-gradient-to-r from-white via-gray-100 to-white text-gray-900"
      } backdrop-blur-md shadow-sm border-b border-gray-300`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Left: Brand Name */}
        <Link
          to="/"
          className={`tektur-font text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          } uppercase`}
        >
          METALENS
        </Link>

        {/* Right: Desktop Navigation */}
        <div className="titillium-web-regular hidden md:flex items-center space-x-6">
          <a href="#" className={`transition ${hoverClasses}`}>
            Home
          </a>
          <button
            onClick={() => scrollToSection("features")}
            className={`transition ${hoverClasses}`}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className={`transition ${hoverClasses}`}
          >
            About
          </button>

          {/* Conditionally render Sign In or User Icon based on authentication */}
          {isAuthenticated ? (
            <User
              className={`w-6 h-6 ${
                theme === "dark" ? "text-white" : "text-gray-700"
              } cursor-pointer`}
              onClick={() => navigate("/profile")} // Navigate to the profile page or handle logout
            />
          ) : (
            <Button
              variant={theme === "dark" ? "link" : "outline"}
              className={`px-4 py-2 
            ${theme === "dark" ? "text-white" : "text-gray-700"}`}
              onClick={() => {
                navigate("/sign-in");
              }}
            >
              Sign In
            </Button>
          )}

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            className="px-2 py-2"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <Menu
            className={`w-6 h-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          />
        </button>
      </div>

      {/* Scroll Progress Bar Below Navbar */}
      <div className="w-full">
        <ScrollProgress className="h-[2px] w-full bg-gradient-to-r from-gray-300/50 to-gray-600/50" />
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div
          className={`md:hidden flex flex-col items-center space-y-4 py-4 shadow-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <a
            href="#"
            className={`transition ${
              theme === "dark"
                ? "text-white hover:text-blue-400"
                : "text-gray-700 hover:text-blue-600"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </a>
          <button
            onClick={() => scrollToSection("features")}
            className={`transition ${
              theme === "dark"
                ? "text-white hover:text-blue-400"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className={`transition ${
              theme === "dark"
                ? "text-white hover:text-blue-400"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            About
          </button>
          <Button
            variant="outline"
            className="px-4 py-2"
            onClick={() => {
              setIsOpen(false);
              navigate("/sign-in");
            }}
          >
            Sign In
          </Button>
        </div>
      )}
    </nav>
  );
}
