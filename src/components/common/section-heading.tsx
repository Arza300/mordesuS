import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-xs font-medium tracking-[0.28em] text-[#A855F7] uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display mt-4 text-3xl leading-[1.1] font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
