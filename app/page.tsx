'use client';

import { useState, useEffect, useRef } from 'react';
import JsonViewer from './components/JsonViewer/JsonViewer';
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor';
import HtmlPreview from './components/HtmlPreview/HtmlPreview';
import MdxViewer from './components/MdxViewer/MdxViewer';
import AdvancedMdxViewer from './components/AdvancedMdxViewer/AdvancedMdxViewer';
import { AnimatePresence, motion } from 'framer-motion';
import { ExportButton } from './components/ExportButton';

export default function Home() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [mdxContent, setMdxContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'html' | 'mdx' | 'advanced-mdx'>('json');
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch the data when the component mounts
  useEffect(() => {
    fetch(window.location.origin + '/sample.json')
      .then(res => res.json())
      .then(data => setJsonData(data))
      .catch(err => console.error('Error loading JSON:', err));

    fetch(window.location.origin + '/sample.md')
      .then(res => res.text())
      .then(content => setMarkdownContent(content))
      .catch(err => console.error('Error loading markdown:', err));

    // Load our new ducks preview file
    fetch(window.location.origin + '/ducks-preview.mdx')
      .then(res => res.text())
      .then(content => setMdxContent(content))
      .catch(err => console.error('Error loading MDX:', err));
  }, []);

  if (!jsonData || !markdownContent || !mdxContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white">Component Stacks</h1>
            <p className="text-lg text-gray-300">
              Edit and preview JSON, Markdown, HTML, 3D models, and MDX content
            </p>
          </div>

          <div className="mb-8 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('json')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              JSON Editor
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'markdown'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Markdown Editor
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'html'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              HTML Preview
            </button>
            <button
              onClick={() => setActiveTab('mdx')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'mdx'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              MDX Viewer
            </button>
            <button
              onClick={() => setActiveTab('advanced-mdx')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'advanced-mdx'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Advanced MDX
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 relative overflow-hidden"
            >
              {activeTab === 'json' ? (
                <JsonViewer 
                  data={jsonData} 
                  onDataChange={(newData) => setJsonData(newData)} 
                />
              ) : activeTab === 'markdown' ? (
                <MarkdownEditor
                  content={markdownContent}
                  onChange={(newContent) => setMarkdownContent(newContent)}
                />
              ) : activeTab === 'html' ? (
                <HtmlPreview />
              ) : activeTab === 'mdx' ? (
                <MdxViewer content={mdxContent} />
              ) : (
                <AdvancedMdxViewer content={mdxContent} contentRef={contentRef} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <div className="flex justify-end p-4 border-t border-border bg-background">
        <ExportButton targetRef={contentRef} />
      </div>
    </div>
  );
} 