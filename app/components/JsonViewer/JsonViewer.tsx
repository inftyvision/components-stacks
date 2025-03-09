import { useState, useCallback } from 'react';
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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const handleDataChange = useCallback(async (newData: any) => {
    setJsonData(newData);
    onDataChange?.(newData);

    // Auto-save to file
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('saved');
      }, 3000);
    }
  }, [onDataChange]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">JSON Viewer</h2>
          <div className="text-sm">
            {saveStatus === 'saving' && (
              <span className="text-yellow-600">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-600">All changes saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600">Error saving changes</span>
            )}
          </div>
        </div>
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