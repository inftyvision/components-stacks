import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  content: string;
  onChange?: (content: string) => void;
}

type EditorMode = 'plain' | 'rich' | 'preview';

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('plain');
  const [markdown, setMarkdown] = useState(content);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const handleContentChange = useCallback(async (newContent: string) => {
    setMarkdown(newContent);
    onChange?.(newContent);

    try {
      setSaveStatus('saving');
      const response = await fetch('/api/save-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      
      setTimeout(() => {
        setSaveStatus('saved');
      }, 3000);
    }
  }, [onChange]);

  const renderEditor = () => {
    switch (mode) {
      case 'plain':
        return (
          <textarea
            value={markdown}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-[600px] p-6 font-mono text-sm bg-gray-900 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            spellCheck={false}
          />
        );
      case 'rich':
        return (
          <div className="h-[600px]">
            <MDEditor
              value={markdown}
              onChange={(val) => val && handleContentChange(val)}
              preview="live"
              hideToolbar={false}
              height={600}
              visibleDragbar={false}
              textareaProps={{
                placeholder: "Write markdown here..."
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#e5e7eb'
              }}
            />
          </div>
        );
      case 'preview':
        return (
          <div className="h-[600px] p-6 overflow-auto prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Markdown Editor</h2>
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
            onClick={() => setMode('plain')}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              mode === 'plain'
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            Plain Text
          </button>
          <button
            onClick={() => setMode('rich')}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              mode === 'rich'
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            Rich Editor
          </button>
          <button
            onClick={() => setMode('preview')}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              mode === 'preview'
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 rounded-lg shadow-xl overflow-hidden"
        >
          {renderEditor()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 