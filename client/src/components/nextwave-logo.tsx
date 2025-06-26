import { Link } from "wouter";
import { GraduationCap } from "lucide-react";

interface NextWaveLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  asButton?: boolean;
  onClick?: () => void;
}

export default function NextWaveLogo({ className = "", size = "md", asButton = false, onClick }: NextWaveLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const content = (
    <>
      <div className="flex items-center justify-center bg-primary rounded-lg p-1.5">
        <GraduationCap className={`${iconSizes[size]} text-white`} />
      </div>
      <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
        NextWave
      </span>
    </>
  );

  const baseClasses = `flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer ${className}`;

  if (asButton) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href="/" className={baseClasses}>
      {content}
    </Link>
  );
}