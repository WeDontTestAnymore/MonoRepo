"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MagicCard } from "../magicui/magic-card";
import trinoLogo from "../../assets/trino.png"; // Ensure this image exists

export default function TrinoIntro() {
  return (
    <Card>
      <MagicCard gradientColor="#D9D9D955">
        {/* Trino Logo & Description */}
        <CardContent className="flex flex-col items-center text-center py-6">
          <img src={trinoLogo} alt="Trino Logo" width={80} height={80} />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">
              Powered by Trino
            </span>{" "}
            for high-performance, federated querying across multiple data
            sources with speed and scalability.
          </p>
        </CardContent>
      </MagicCard>
    </Card>
  );
}
