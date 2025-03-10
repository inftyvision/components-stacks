'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentProps } from 'react';
import clsx from 'clsx';
import { Resizable } from 're-resizable';
import AdvancedMarkdown from './AdvancedMarkdown';
import '../../styles/mdx-theme.css';

interface AdvancedMdxViewerProps {
  content: string;
  designSystem?: string;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface VirtualPage {
  title: string;
  content: string;
}

interface ContentBlock {
  type: 'header' | 'content';
  content: string;
  height?: number;
}

export default function AdvancedMdxViewer({ content, designSystem }: AdvancedMdxViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 600, height: 600 });
  const [virtualPages, setVirtualPages] = useState<VirtualPage[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Split content into blocks (headers and content)
  const splitContentIntoBlocks = (markdown: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    const lines = markdown.split('\n');
    let currentBlock: ContentBlock = {
      type: 'content',
      content: ''
    };

    lines.forEach((line: string) => {
      const isHeader = line.startsWith('# ');
      
      if (isHeader) {
        if (currentBlock.content) {
          blocks.push(currentBlock);
        }
        blocks.push({
          type: 'header',
          content: line
        });
        currentBlock = {
          type: 'content',
          content: ''
        };
      } else {
        currentBlock = {
          type: 'content',
          content: currentBlock.content + (currentBlock.content ? '\n' : '') + line
        };
      }
    });

    if (currentBlock.content.trim()) {
      blocks.push(currentBlock);
    }

    return blocks;
  };

  // Measure element height
  const measureElement = (element: string): number => {
    if (!measureRef.current) return 0;

    const container = document.createElement('div');
    container.style.width = `${viewportSize.width - 48}px`;
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.className = 'prose prose-invert';
    
    // Create element with proper markdown structure
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content-container';
    contentDiv.innerHTML = element;
    container.appendChild(contentDiv);
    
    measureRef.current.appendChild(container);
    const height = container.getBoundingClientRect().height;
    measureRef.current.removeChild(container);
    
    return Math.ceil(height);
  };

  // Create virtual pages
  const createVirtualPages = () => {
    if (!measureRef.current) return;

    const blocks = splitContentIntoBlocks(content);
    const pageHeaderHeight = 60;
    const pagePadding = 32;
    const pageMargin = 24;
    const availableHeight = viewportSize.height - pageHeaderHeight - pagePadding - pageMargin;
    
    const newPages: VirtualPage[] = [];
    let currentPageData: VirtualPage = {
      title: 'Document',
      content: ''
    };
    let currentContent: string[] = [];
    let currentHeight = 0;
    let currentHeader = '';

    // Helper function to finalize current page
    const finalizePage = () => {
      if (currentContent.length > 0) {
        currentPageData.content = currentContent.join('\n');
        newPages.push({ ...currentPageData });
        currentContent = [];
        currentHeight = 0;
      }
    };

    // Helper function to add content with height tracking
    const addContent = (content: string) => {
      const elementHeight = measureElement(content);
      if (currentHeight + elementHeight > availableHeight * 0.9) {
        finalizePage();
        // If this is a continuation page
        if (currentHeader) {
          currentPageData.title = currentHeader.replace('# ', '') + ' (continued)';
        }
      }
      currentContent.push(content);
      currentHeight += elementHeight;
    };

    // Process each block
    blocks.forEach((block) => {
      if (block.type === 'header') {
        // Headers always start a new page unless it's the first one
        if (currentContent.length > 0) {
          finalizePage();
        }
        currentHeader = block.content;
        currentPageData.title = block.content.replace('# ', '');
        addContent(block.content);
      } else {
        // Split content into lines and elements
        const lines = block.content.split('\n');
        let currentLine = '';
        
        lines.forEach((line, index) => {
          // Check if this is a special element (like code block, list, etc)
          const isCodeBlock = line.startsWith('```');
          const isList = line.match(/^(\s*[-*+]|\d+\.)\s/);
          const isQuote = line.startsWith('>');
          
          if (isCodeBlock || isList || isQuote || line.trim() === '') {
            // If we have accumulated normal text, add it first
            if (currentLine) {
              addContent(currentLine);
              currentLine = '';
            }
            // Add the special element
            if (line.trim() !== '') {
              addContent(line);
            }
          } else {
            // Accumulate normal text lines
            currentLine += (currentLine ? '\n' : '') + line;
            
            // If this is the last line or next line is a special element, add accumulated text
            if (index === lines.length - 1 && currentLine) {
              addContent(currentLine);
              currentLine = '';
            }
          }
        });
      }
    });

    // Add the last page if there's content
    if (currentContent.length > 0) {
      finalizePage();
    }

    if (newPages.length > 0) {
      setVirtualPages(newPages);
      const currentPageIndex = currentPage;
      if (currentPageIndex >= newPages.length) {
        setCurrentPage(Math.max(0, newPages.length - 1));
      }
    }
  };

  // Initial page creation
  useEffect(() => {
    if (content && viewportSize.width > 0 && viewportSize.height > 0) {
      const timer = setTimeout(() => {
        createVirtualPages();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content, viewportSize.width, viewportSize.height]);

  // Handle resize with debounce
  const handleResize = (e: any, direction: any, ref: HTMLElement) => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const newSize = {
        width: ref.offsetWidth,
        height: ref.offsetHeight
      };
      if (newSize.width !== viewportSize.width || newSize.height !== viewportSize.height) {
        setViewportSize(newSize);
      }
    }, 100);
  };

  const handleResizeStop = handleResize;

  const handleCopy = (text: string) => {
    console.log('Copied:', text.slice(0, 50) + '...');
  };

  const handleZoom = (level: number) => {
    console.log('Zoom level:', level);
  };

  // Show loading state only when there's no content
  if (!content) {
    return (
      <div className="bg-card p-6">
        <div className="flex h-[600px] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If we have content but no pages yet, show the entire content while pages are being created
  if (virtualPages.length === 0) {
    return (
      <Resizable
        defaultSize={{ width: 600, height: 600 }}
        minHeight={300}
        minWidth={300}
        maxHeight={1200}
        maxWidth={1200}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        className="bg-card relative"
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: true,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-medium text-card-foreground truncate">
                Document View
              </h1>
              <p className="text-sm text-muted-foreground">
                Processing content...
              </p>
            </div>
          </div>
          
          <div ref={contentRef} className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 p-6">
              <div className="content-container h-full">
                <AdvancedMarkdown
                  content={content}
                  onCopy={handleCopy}
                  onZoom={handleZoom}
                />
              </div>
            </div>
          </div>

          {/* Hidden measure container */}
          <div 
            ref={measureRef} 
            className="absolute -left-[9999px] -top-[9999px] overflow-hidden prose prose-invert"
            style={{ width: viewportSize.width - 48 }} // Account for padding
          />
        </div>
      </Resizable>
    );
  }

  return (
    <Resizable
      defaultSize={{ width: 600, height: 600 }}
      minHeight={300}
      minWidth={300}
      maxHeight={1200}
      maxWidth={1200}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      className="bg-card relative"
      enable={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: true,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-medium text-card-foreground truncate">
              {virtualPages[currentPage]?.title || 'Document View'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {virtualPages.length}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={clsx(
                "px-4 py-2 rounded-lg transition-colors",
                currentPage === 0
                  ? "bg-primary/50 text-primary-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(virtualPages.length - 1, p + 1))}
              disabled={currentPage === virtualPages.length - 1}
              className={clsx(
                "px-4 py-2 rounded-lg transition-colors",
                currentPage === virtualPages.length - 1
                  ? "bg-primary/50 text-primary-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Next
            </button>
          </div>
        </div>
        
        <div ref={contentRef} className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 p-6"
            >
              <div className="content-container h-full">
                <AdvancedMarkdown
                  content={virtualPages[currentPage]?.content || content}
                  onCopy={handleCopy}
                  onZoom={handleZoom}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hidden measure container */}
        <div 
          ref={measureRef} 
          className="absolute -left-[9999px] -top-[9999px] overflow-hidden prose prose-invert"
          style={{ width: viewportSize.width - 48 }} // Account for padding
        />

        <div className="absolute bottom-0 right-0 p-2 text-xs text-muted-foreground">
          {viewportSize.width} x {viewportSize.height}
        </div>
      </div>
    </Resizable>
  );
} 