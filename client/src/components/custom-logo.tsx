import React, { useState, useEffect } from 'react';

interface CustomLogoProps {
  className?: string;
  variant?: "primary" | "white" | "icon-only";
  size?: "sm" | "md" | "lg";
}

export default function CustomLogo({ 
  className = "", 
  variant = "primary", 
  size = "md" 
}: CustomLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Load logo URL from localStorage
  useEffect(() => {
    const savedLogoUrl = localStorage.getItem('customLogoUrl');
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
    }
  }, []);
  
  const sizeClasses = {
    sm: "h-40",
    md: "h-56",
    lg: "h-72"
  };

  const getLogoSrc = () => {
    switch (variant) {
      case "white":
        return "/logos/nextwave-white.png";
      case "icon-only":
        return "/logos/nextwave-icon-primary.png";
      default:
        return "/logos/nextwave-primary.png";
    }
  };
  
  // If a custom logo is set, show it
  if (logoUrl) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="Custom Logo" 
          className={`${sizeClasses[size]} object-contain`}
          onError={() => {
            console.error("Error loading custom logo");
            setLogoUrl(null);
            localStorage.removeItem('customLogoUrl');
          }}
        />
      </div>
    );
  }
  
  // Use the new NextWave logo
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={getLogoSrc()} 
        alt="NextWave Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}