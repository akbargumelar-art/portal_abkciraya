
import React from 'react';

interface SortIconProps extends React.SVGProps<SVGSVGElement> {
  direction: 'asc' | 'desc' | null;
}

const SortIcon: React.FC<SortIconProps> = ({ direction, ...props }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <path d="m7 15 5 5 5-5" className={direction === 'desc' ? 'opacity-100' : 'opacity-40'} />
    <path d="m7 9 5-5 5 5" className={direction === 'asc' ? 'opacity-100' : 'opacity-40'} />
  </svg>
);

export default SortIcon;
