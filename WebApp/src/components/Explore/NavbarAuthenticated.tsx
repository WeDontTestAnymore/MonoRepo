import { useState } from "react";
import { Menu, User } from "lucide-react"; // Added User Icon
import { ScrollProgress } from "../magicui/scroll-progress";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Link } from "react-router-dom";

export default function NavbarAuthenticated() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Left: Brand Name */}
        <Link
          to="/"
          className="tektur-font text-2xl font-bold text-gray-900 uppercase"
        >
          METALENS
        </Link>

        {/* Right: Show User Icon If Authenticated */}
        {isAuthenticated && (
          <User className="w-6 h-6 text-gray-900 cursor-pointer" />
        )}

        {/* Mobile Menu Button */}
        {!isAuthenticated && (
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        )}
      </div>

      {/* Scroll Progress Bar Below Navbar */}
      <div className="w-full">
        <ScrollProgress className="h-[2px] w-full bg-gradient-to-r from-gray-300/50 to-gray-600/50" />
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && !isAuthenticated && (
        <div className="md:hidden flex flex-col items-center space-y-4 bg-white/90 backdrop-blur-md py-4 shadow-md">
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 transition"
            onClick={() => setIsOpen(false)}
          >
            Home
          </a>
        </div>
      )}
    </nav>
  );
}
