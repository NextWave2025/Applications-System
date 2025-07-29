import { Link } from "wouter";

interface NextWaveLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  asButton?: boolean;
  onClick?: () => void;
  variant?: "primary" | "white" | "icon-only";
}

export default function NextWaveLogo({ 
  className = "", 
  size = "md", 
  asButton = false, 
  onClick, 
  variant = "primary" 
}: NextWaveLogoProps) {
  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-20"
  };

  const getLogoSrc = () => {
    switch (variant) {
      case "white":
        return "/logos/nextwave-white-new.png";
      case "icon-only":
        return "/logos/nextwave-icon-primary.png";
      default:
        return "/logos/nextwave-primary-new.png";
    }
  };

  const content = (
    <img 
      src={getLogoSrc()} 
      alt="NextWave Logo" 
      className={`${sizeClasses[size]} object-contain`}
    />
  );

  const baseClasses = `hover:opacity-80 transition-opacity cursor-pointer ${className}`;

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