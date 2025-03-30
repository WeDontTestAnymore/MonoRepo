import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "../magicui/animated-beam";
import s3Bucket from "../../assets/s3Bucket.png";
import azureBlob from "../../assets/azureBlob.png";
import minIo from "../../assets/minIo.png";
import parquet from "../../assets/parquet.png";
import hudi from "../../assets/hudi.png";
import delta from "../../assets/delta.png";
import iceberg from "../../assets/iceberg.png";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand05Icon } from "@hugeicons/core-free-icons";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 items-center justify-center rounded-full border-2 bg-white p-4 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function ProcessingIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[400px] w-full items-center justify-center"
      ref={containerRef}
    >
      {/* Grid Layout with 3 Columns */}
      <div className="grid grid-cols-3 w-full max-w-4xl gap-16 items-center">
        {/* Left Column */}
        <div className="flex flex-col items-center gap-10 w-[80%]">
          <Circle ref={div1Ref}>
            <Icons.s3Bucket />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.azureBlob />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.minIo />
          </Circle>
        </div>

        {/* Middle Column */}
        <div className="flex justify-center w-[80%]">
          <Circle ref={middleRef}>
            <HugeiconsIcon icon={MagicWand05Icon} />
          </Circle>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center gap-10 w-[80%]">
          <Circle ref={div4Ref}>
            <Icons.parquet />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.hudi />
          </Circle>
          <Circle ref={div6Ref}>
            <Icons.delta />
          </Circle>
          <Circle ref={div7Ref}>
            <Icons.iceberg />
          </Circle>
        </div>
      </div>

      {/* Animated Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={middleRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={middleRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={middleRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={middleRef}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={middleRef}
        toRef={div5Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={middleRef}
        toRef={div6Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={middleRef}
        toRef={div7Ref}
      />
    </div>
  );
}

const Icons = {
  s3Bucket: () => (
    <img src={s3Bucket} alt="S3 Bucket" width="100" height="100" />
  ),
  azureBlob: () => (
    <img src={azureBlob} alt="Azure Blob" width="100" height="100" />
  ),
  minIo: () => <img src={minIo} alt="MinIO" width="100" height="100" />,
  parquet: () => <img src={parquet} alt="Parquet" width="100" height="100" />,
  hudi: () => <img src={hudi} alt="Hudi" width="100" height="100" />,
  delta: () => <img src={delta} alt="Delta" width="100" height="100" />,
  iceberg: () => <img src={iceberg} alt="Iceberg" width="100" height="100" />,
};
