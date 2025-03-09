'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ComponentProps } from 'react';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import '../../styles/mdx-theme.css';

interface MdxViewerProps {
  content: string;
}

interface Page {
  title: string;
  content: string;
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
}

const components: ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: props => <h1 {...props} />,
  h2: props => <h2 {...props} />,
  h3: props => <h3 {...props} />,
  p: props => <p {...props} />,
  ul: props => <ul {...props} />,
  ol: props => <ol {...props} />,
  li: props => <li {...props} />,
  code: ({ inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (inline) {
      return <code {...props}>{children}</code>;
    }

    return (
      <div className="relative group">
        {language && (
          <div className="language-badge">
            {language}
          </div>
        )}
        <pre>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  blockquote: props => <blockquote {...props} />,
  a: props => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  strong: props => <strong {...props} />,
  em: props => <em {...props} />,
  table: props => <table {...props} />,
  th: props => <th {...props} />,
  td: props => <td {...props} />,
  hr: () => <hr />,
};

export default function MdxViewer({ content }: MdxViewerProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Split content into pages based on h1 headers
    const pageRegex = /^#\s+(.+?)(?=\n|$)([\s\S]*?)(?=(?:^#\s+|\Z))/gm;
    const matches = Array.from(content.matchAll(pageRegex));
    
    const parsedPages = matches.map(match => {
      const title = match[1].trim();
      const pageContent = match[2].trim();
      return { title, content: pageContent };
    });

    setPages(parsedPages);
  }, [content]);

  if (pages.length === 0) {
    return (
      <div className="bg-card p-6">
        <div className="flex h-[600px] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-medium text-card-foreground truncate">
            {currentPageData.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pages.length}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              currentPage === 0
                ? "bg-indigo-600 text-white opacity-50 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              currentPage === pages.length - 1
                ? "bg-indigo-600 text-white opacity-50 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            Next
          </button>
        </div>
      </div>
      
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6">
          <div className="content-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {currentPageData.content}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 