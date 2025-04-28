import React, { useState, useEffect } from 'react';

interface CustomLogoProps {
  className?: string;
  variant?: "default" | "white";
}

export default function CustomLogo({ className = "", variant = "default" }: CustomLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const defaultLogoText = "Guide";
  const textColor = variant === "white" ? "text-white" : "text-primary";
  
  // Load logo URL from localStorage
  useEffect(() => {
    const savedLogoUrl = localStorage.getItem('customLogoUrl');
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
    }
  }, []);
  
  // If a custom logo is set, show it
  if (logoUrl) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="Custom Logo" 
          className="h-8 object-contain"
          onError={() => {
            console.error("Error loading custom logo");
            setLogoUrl(null);
            localStorage.removeItem('customLogoUrl');
          }}
        />
      </div>
    );
  }
  
  // Otherwise show default SVG logo
  const logoColor = variant === "white" ? "#FFFFFF" : "#EF3009";
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width="120" 
        height="32" 
        viewBox="0 0 120 32" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-8"
      >
        {/* G letter */}
        <path 
          d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C19.84 26 23.15 23.75 24.80 20.5H16V16H29.5C29.5 22.75 23.5 28 16 28C9.37 28 4 22.63 4 16C4 9.37 9.37 4 16 4C20.5 4 24.45 6.50 26.45 10.20L24.15 11.45C22.50 8.45 19.45 6 16 6Z" 
          fill={logoColor}
        />
        {/* "uide" text */}
        <path 
          d="M39 8H42V18C42 19.0609 41.5786 20.0783 40.8284 20.8284C40.0783 21.5786 39.0609 22 38 22H36V19H38C38.2652 19 38.5196 18.8946 38.7071 18.7071C38.8946 18.5196 39 18.2652 39 18V8Z" 
          fill={logoColor}
        />
        <path 
          d="M50 8V22H47V20.5C46.2316 21.4483 45.1385 22.001 44 22C41.77 22 40 20.2 40 17C40 13.8 41.77 12 44 12C45.1387 12.001 46.2316 12.5543 47 13.5V8H50ZM44.5 19C45.9 19 47 18.1 47 17C47 15.9 45.9 15 44.5 15C43.1 15 42 15.9 42 17C42 18.1 43.1 19 44.5 19Z" 
          fill={logoColor}
        />
        <path 
          d="M52 17C52 13.8 54.21 12 56.5 12C58.79 12 61 13.8 61 17C61 20.2 58.79 22 56.5 22C54.21 22 52 20.2 52 17ZM58.5 17C58.5 15.3 57.73 14.5 56.5 14.5C55.27 14.5 54.5 15.3 54.5 17C54.5 18.7 55.27 19.5 56.5 19.5C57.73 19.5 58.5 18.7 58.5 17Z" 
          fill={logoColor}
        />
        <path 
          d="M68 14.5H65.5V18.5C65.5 18.7652 65.6054 19.0196 65.7929 19.2071C65.9804 19.3946 66.2348 19.5 66.5 19.5H68V22H66C64.9391 22 63.9217 21.5786 63.1716 20.8284C62.4214 20.0783 62 19.0609 62 18V14.5H60.5V12H62V9H65.5V12H68V14.5Z" 
          fill={logoColor}
        />
        <path 
          d="M75 14.5H72.5V18.5C72.5 18.7652 72.6054 19.0196 72.7929 19.2071C72.9804 19.3946 73.2348 19.5 73.5 19.5H75V22H73C71.9391 22 70.9217 21.5786 70.1716 20.8284C69.4214 20.0783 69 19.0609 69 18V14.5H67.5V12H69V9H72.5V12H75V14.5Z" 
          fill={logoColor}
        />
      </svg>
    </div>
  );
}