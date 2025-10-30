
import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.25a.75.75 0 01.75.75v2.386a8.995 8.995 0 016.891 4.113.75.75 0 11-1.28.762 7.5 7.5 0 00-11.222 0 .75.75 0 01-1.28-.762A8.995 8.995 0 0111.25 5.386V3a.75.75 0 01.75-.75z" />
    <path fillRule="evenodd" d="M12 12.75a3 3 0 100-6 3 3 0 000 6zM6.31 15.106a8.995 8.995 0 0111.38 0 .75.75 0 11-1.06 1.06 7.5 7.5 0 00-9.26 0 .75.75 0 01-1.06-1.06z" clipRule="evenodd" />
    <path d="M12 21.75a.75.75 0 01-.75-.75v-2.386a8.995 8.995 0 01-6.891-4.113.75.75 0 111.28-.762 7.5 7.5 0 0011.222 0 .75.75 0 111.28.762A8.995 8.995 0 0112.75 18.614V21a.75.75 0 01-.75.75z" />
  </svg>
);

export default LogoIcon;
