import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import JsonVisualView from './JsonVisualView';
import JsonTextView from './JsonTextView';

interface JsonViewerProps {
  data: any;
  onDataChange?: (newData: any) => void;
}

export default function JsonViewer({ data, onDataChange }: JsonViewerProps) {
  const [isVisualView, setIsVisualView] = useState(true);
  const [jsonData, setJsonData] = useState(data);

  const handleDataChange = (newData: any) => {
    setJsonData(newData);
    onDataChange?.(newData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">JSON Viewer</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsVisualView(true)}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              isVisualView
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Visual
          </button>
          <button
            onClick={() => setIsVisualView(false)}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              !isVisualView
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Text
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isVisualView ? 'visual' : 'text'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 rounded-lg shadow-xl p-6"
        >
          {isVisualView ? (
            <JsonVisualView data={jsonData} onDataChange={handleDataChange} />
          ) : (
            <JsonTextView data={jsonData} onDataChange={handleDataChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 