import { motion } from "framer-motion";
import { FlipWords } from "../ui/flip-words";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightDoubleIcon } from "@hugeicons/core-free-icons";

export default function Header() {
  const words = ["Instant.", "Unified.", "Insightful."];
  const navigate = useNavigate();

  return (
    <motion.header
      className="flex flex-col items-center justify-center w-full py-2 px-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Centered Content */}
      <div className="text-center">
        <h2 className="tektur-font text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-200 leading-tight">
          Explore, Analyze, and Optimize Metadata That is{" "}
          <span className="text-blue-600">
            <FlipWords words={words} />
          </span>
        </h2>

        {/* Centered Button Wrapper */}
        <div className="exo-2-font flex justify-center mt-5">
          <button
            type="submit"
            onClick={() => navigate("/explore")}
            className="relative flex justify-center items-center gap-3 border border-[#000] rounded-xl text-[#FFF] font-black bg-[#000] uppercase px-6 py-3 md:px-8 md:py-4 z-10 overflow-hidden ease-in-out duration-300 group hover:text-[#000] hover:bg-[#FFF] active:scale-95 active:duration-0 focus:bg-[#FFF] focus:text-[#000]"
          >
            <span className="truncate ease-in-out duration-300 group-active:-translate-x-96 group-focus:translate-x-96">
              Dive into Metalens
            </span>
            {/* Visible SVG Icon */}
            <HugeiconsIcon
              icon={ArrowRightDoubleIcon}
              className="w-6 h-6 ease-in-out duration-300 group-active:translate-x-96 group-focus:-translate-x-96"
            />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
