import React from 'react';

const Logo = ({ className = '', style = {}, width, height, circleColor = '#295593', textColor = '#E8A958' }) => {
  return (
    <svg 
      className={className} 
      style={style} 
      width={width || "100%"} 
      height={height || "100%"} 
      viewBox="0 -10 520 110" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon 'i' */}
      <circle cx="10" cy="10" r="10" fill={circleColor} />
      <rect x="0" y="24" width="20" height="20" rx="4" fill={textColor} />
      <rect x="0" y="48" width="20" height="20" rx="4" fill={textColor} />
      <rect x="0" y="72" width="20" height="20" rx="4" fill={textColor} />
      
      {/* F stem */}
      <rect x="24" y="0" width="20" height="20" rx="4" fill={textColor} />
      <rect x="24" y="24" width="20" height="20" rx="4" fill={textColor} />
      <rect x="24" y="48" width="20" height="20" rx="4" fill={textColor} />
      <rect x="24" y="72" width="20" height="20" rx="4" fill={textColor} />
      
      {/* F bars */}
      <rect x="48" y="0" width="20" height="20" rx="4" fill={textColor} />
      <rect x="48" y="48" width="20" height="20" rx="4" fill={textColor} />

      {/* Text "esporte" */}
      <text 
        x="80" 
        y="80" 
        fontFamily="'Poppins', sans-serif" 
        fontWeight="700" 
        fontSize="92px" 
        letterSpacing="-2px"
        fill={textColor}
      >
        esporte
      </text>
    </svg>
  );
};

export default Logo;
