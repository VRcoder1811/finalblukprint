import React from 'react';

const FeatureSplitter: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="bg-indigo-50 p-6 rounded-full mb-6">
        <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">PDF Splitter</h2>
      <p className="text-slate-500 max-w-lg text-lg leading-relaxed">
        We are working hard to bring you the best PDF splitting experience. 
        Soon you will be able to extract pages, split documents by ranges, and more.
      </p>
      <div className="mt-8 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
        Coming Soon to Bulk Print Raghu
      </div>
    </div>
  );
};

export default FeatureSplitter;