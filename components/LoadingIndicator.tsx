
import React from 'react';
import { LogoIcon } from './icons';

interface SkeletonTableProps {
  rows?: number;
  columns: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 8, columns }) => {
    // To make it look more realistic, vary the width of skeleton bars
    const widths = Array.from({ length: columns }, () => Math.floor(Math.random() * (90 - 50 + 1)) + 50);

    return (
        <div className="w-full animate-pulse p-6 space-y-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex space-x-4 mb-6 border-b border-gray-100 pb-4">
                 {widths.map((width, j) => (
                    <div key={`head-${j}`} className="h-4 bg-gray-300 rounded flex-1 opacity-70" style={{ maxWidth: `${width}%` }}></div>
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex space-x-4 items-center">
                    {widths.map((width, j) => (
                        <div key={j} className="h-3 bg-gray-200 rounded flex-1" style={{ maxWidth: `${width}%` }}></div>
                    ))}
                </div>
            ))}
        </div>
    );
};


interface LoadingIndicatorProps {
  type?: 'spinner' | 'table';
  text?: string;
  tableColumns?: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ type = 'spinner', text = 'Memuat data...', tableColumns = 5 }) => {
  if (type === 'table') {
    return (
        <div className="w-full fade-in">
            <SkeletonTable columns={tableColumns} />
            <p className="mt-4 text-center text-gray-500 text-sm font-medium animate-pulse">{text}</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px] fade-in w-full">
      <div className="relative flex items-center justify-center">
          {/* Static background ring */}
          <div className="h-20 w-20 rounded-full border-4 border-gray-200"></div>
          
          {/* Spinning colored ring */}
          <div className="absolute h-20 w-20 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
          
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
             <LogoIcon className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
      </div>
      <div className="mt-6 flex flex-col items-center space-y-1">
        <p className="text-gray-700 font-semibold text-lg tracking-wide animate-pulse">{text}</p>
        <p className="text-gray-400 text-xs">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;