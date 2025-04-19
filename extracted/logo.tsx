import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

export default function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-8 w-8">
        <div
          className={cn(
            "absolute inset-0 rounded-md",
            variant === "white" ? "bg-white" : "bg-black"
          )}
        ></div>
        <div
          className={cn(
            "absolute inset-[2px] rounded-[4px] flex items-center justify-center",
            variant === "white" ? "bg-black" : "bg-white"
          )}
        >
          <div
            className={cn(
              "h-3 w-3 rounded-sm",
              variant === "white" ? "bg-white" : "bg-black"
            )}
          ></div>
        </div>
      </div>
      <span
        className={cn(
          "text-xl font-bold",
          variant === "white" ? "text-white" : "text-black"
        )}
      >
        Guide
      </span>
    </div>
  );
}
