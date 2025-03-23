import React from 'react';

interface GardenLogoProps {
  className?: string;
}

export const GardenLogo: React.FC<GardenLogoProps> = ({ className }) => (
  <svg 
    className={className || "garden-logo"} 
    viewBox="0 0 100 100" 
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#66BB6A" />
        <stop offset="100%" stopColor="#388E3C" />
      </linearGradient>
    </defs>
    
    {/* Simple circular background */}
    <circle cx="50" cy="50" r="48" fill="white" opacity="0.9" />
    
    {/* Stylized leaf */}
    <path
      d="M70 30
         C60 20, 30 20, 20 40
         C15 50, 20 70, 40 75
         C45 65, 50 55, 55 50
         C70 65, 75 30, 70 30
         Z"
      fill="url(#leafGradient)"
    />
    
    {/* Simple stem */}
    <path
      d="M40 75
         C45 80, 45 85, 45 90"
      stroke="#2E7D32"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
); 