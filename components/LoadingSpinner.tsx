
import React from 'react';

const LoadingSpinner: React.FC<{text?: string}> = ({text}) => (
  <div className="flex flex-col justify-center items-center p-10 space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    {text && <p className="text-lg text-gray-300">{text}</p>}
  </div>
);

export default LoadingSpinner;
