import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
    {/* Outermost ring, breaks at 3 and 9 o'clock */}
    <path d="M 50,6 A 44,44 0 1 1 50,94" />
    <path d="M 50,6 A 44,44 0 0 1 50,94" />
    
    {/* Second ring, breaks at ~1:30 and ~7:30 */}
    <path d="M 81.3,60.6 A 34,34 0 1 1 18.7,39.4" />
    
    {/* Third ring, breaks at ~10:30 and ~4:30 */}
    <path d="M 26.8,26.8 A 24,24 0 1 1 73.2,73.2" />
    
    {/* Fourth ring, break at 6 o'clock */}
    <path d="M 36,50 A 14,14 0 1 1 64,50" />
    
    {/* Innermost circle */}
    <circle cx="50" cy="50" r="4" />
  </svg>
);

export default LogoIcon;
