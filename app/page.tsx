'use client';

import { useState, useEffect } from 'react';
import JsonViewer from './components/JsonViewer/JsonViewer';

export default function Home() {
  const [jsonData, setJsonData] = useState<any>(null);

  // Fetch the JSON data when the component mounts
  useEffect(() => {
    fetch(window.location.origin + '/sample.json')
      .then(res => res.json())
      .then(data => setJsonData(data))
      .catch(err => console.error('Error loading JSON:', err));
  }, []); // Empty dependency array for mounting only

  if (!jsonData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">JSON Viewer & Editor</h1>
          <p className="text-lg text-gray-300">
            View and edit JSON data in both visual and text formats
          </p>
        </div>
        <JsonViewer 
          data={jsonData} 
          onDataChange={(newData) => setJsonData(newData)} 
        />
      </div>
    </main>
  );
} 