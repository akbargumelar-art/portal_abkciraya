import React from 'react';

const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 12h-3a7.5 7.5 0 00-7.5-7.5h1.5v-1.5a7.5 7.5 0 007.5-7.5h3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-2.25a1.125 1.125 0 00-1.125 1.125v.375m1.5-1.5V18a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v1.5m3-1.5V9" />
  </svg>
);

export default MegaphoneIcon;