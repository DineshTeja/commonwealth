import React from 'react';
import Image from 'next/image';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center w-full">
      <p className="text-lg mb-4 text-purple-800 font-medium">Loading...</p>
      <div className="animate-spin">
        <Image
          src="/images/commonwealth.png"
          alt="Loading"
          width={75}
          height={75}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;