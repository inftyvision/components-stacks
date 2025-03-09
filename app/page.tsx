'use client';

import { useState, useEffect } from 'react';
import JsonViewer from './components/JsonViewer/JsonViewer';
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor';
import HtmlPreview from './components/HtmlPreview/HtmlPreview';
import GlbViewer from './components/GlbViewer/GlbViewer';
import MdxViewer from './components/MdxViewer/MdxViewer';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [mdxContent, setMdxContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'html' | '3d' | 'mdx'>('json');

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

    fetch(window.location.origin + '/sample.mdx')
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
            onClick={() => setActiveTab('3d')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === '3d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            3D Viewer
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
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
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
            ) : activeTab === '3d' ? (
              <GlbViewer modelPath="/glb/sample.glb" />
            ) : (
              <MdxViewer content={mdxContent} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
} 