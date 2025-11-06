import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 8, columns }) => {
    // To make it look more realistic, vary the width of skeleton bars
    const widths = Array.from({ length: columns }, () => Math.floor(Math.random() * (90 - 50 + 1)) + 50);

    return (
        <div className="w-full animate-pulse p-4 space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex space-x-4 items-center">
                    {widths.map((width, j) => (
                        <div key={j} className="h-5 bg-gray-200 rounded-md flex-1" style={{ maxWidth: `${width}%` }}></div>
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
        <div className="p-8 text-center bg-white rounded-lg shadow">
            <SkeletonTable columns={tableColumns} />
            <p className="mt-4 text-gray-600 font-semibold">{text}</p>
        </div>
    );
  }

  return (
    <div className="p-8 text-center flex flex-col items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-red-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-600 font-semibold animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingIndicator;
