import React from 'react';

const TicketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75v10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9h15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15h15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h19.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75C2.25 5.625 3.125 4.5 4.5 4.5h15c1.375 0 2.25 1.125 2.25 2.25v10.5c0 1.125-0.875 2.25-2.25 2.25h-15c-1.375 0-2.25-1.125-2.25-2.25V6.75z" />
  </svg>
);

export default TicketIcon;