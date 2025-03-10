'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import type { ComponentProps } from 'react';
import { 
  ClipboardIcon, 
  CheckIcon, 
  MagnifyingGlassMinusIcon, 
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React from 'react';

interface AdvancedMarkdownProps {
  content: string;
  onCopy?: (text: string) => void;
  onZoom?: (level: number) => void;
  className?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}

interface MarkdownComponentProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
  children?: React.ReactNode;
  inline?: boolean;
}

const AdvancedMarkdown: React.FC<AdvancedMarkdownProps> = ({ content, onCopy, onZoom, className, contentRef }) => {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const internalRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (text: string, blockId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMap(prev => ({ ...prev, [blockId]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [blockId]: false }));
    }, 2000);
    onCopy?.(text);
  };

  const handleZoom = (delta: number) => {
    const newLevel = Math.max(0.5, Math.min(2, zoomLevel + delta));
    setZoomLevel(newLevel);
    onZoom?.(newLevel);
  };

  const components: Components = {
    h1: (props: MarkdownComponentProps) => (
      <h1 
        {...props} 
        className="text-2xl font-bold text-card-foreground mb-6"
      />
    ),
    h2: (props: MarkdownComponentProps) => (
      <h2 
        {...props} 
        className="text-xl font-semibold text-card-foreground mt-8 mb-4"
      />
    ),
    h3: (props: MarkdownComponentProps) => (
      <h3 
        {...props} 
        className="text-lg font-medium text-card-foreground mt-6 mb-3"
      />
    ),
    p: (props: MarkdownComponentProps) => (
      <p 
        {...props} 
        className="text-base text-card-foreground leading-relaxed mb-4"
      />
    ),
    ul: (props: MarkdownComponentProps) => {
      const depth = React.Children.toArray(props.children).reduce((maxDepth, child) => {
        if (typeof child === 'object' && 'props' in child && 'depth' in child.props) {
          const childDepth = Number(child.props.depth) || 0;
          return Math.max(maxDepth as number, childDepth);
        }
        return maxDepth;
      }, 0);

      return (
        <ul 
          {...props} 
          className={clsx(
            "space-y-2 mb-4",
            depth === 0 ? "ml-4" : "ml-6",
            depth === 0 ? "list-disc" : "list-circle"
          )}
        />
      );
    },
    ol: (props: MarkdownComponentProps) => {
      const depth = React.Children.toArray(props.children).reduce((maxDepth, child) => {
        if (typeof child === 'object' && 'props' in child && 'depth' in child.props) {
          const childDepth = Number(child.props.depth) || 0;
          return Math.max(maxDepth as number, childDepth);
        }
        return maxDepth;
      }, 0);

      const listStyle = depth === 0 ? "decimal" : 
                       depth === 1 ? "lower-alpha" : 
                       depth === 2 ? "lower-roman" : "decimal";
      
      return (
        <ol 
          {...props} 
          className={clsx(
            "space-y-2 mb-4",
            depth === 0 ? "ml-4" : "ml-6",
            `list-${listStyle}`
          )}
        />
      );
    },
    li: (props: MarkdownComponentProps) => {
      const hasNestedList = React.Children.toArray(props.children).some(
        child => typeof child === 'object' && 'type' in child && 
        (child.type === 'ul' || child.type === 'ol')
      );
      
      const hasMultipleBlocks = React.Children.toArray(props.children).filter(
        child => typeof child === 'object' && 'type' in child
      ).length > 1;

      return (
        <li 
          {...props} 
          className={clsx(
            "text-card-foreground leading-relaxed",
            hasNestedList && "mt-2",
            hasMultipleBlocks && "space-y-2",
            "pl-1"
          )}
        />
      );
    },
    code: ({ inline, className, children, ...props }: MarkdownComponentProps) => {
      const content = React.Children.toArray(children).join('').trim();
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const blockId = React.useId();
      
      if (!content) return null;
      
      if (inline) {
        return (
          <code
            className={clsx(
              "px-1.5 py-0.5 rounded-md bg-code-bg font-mono text-sm",
              className
            )}
            {...props}
          >
            {content}
          </code>
        );
      }

      return (
        <code 
          className={clsx(
            "font-mono text-sm block relative group",
            className
          )} 
          data-language={language}
          {...props}
        >
          {content}
          <button
            onClick={() => handleCopy(content, blockId)}
            className={clsx(
              "absolute top-2 right-2 p-2 rounded-md",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-primary/10"
            )}
            aria-label="Copy code"
          >
            {copiedMap[blockId] ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClipboardIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </code>
      );
    },
    pre: ({ children, className, ...props }) => {
      // Find the code element inside pre
      const codeElement = React.Children.toArray(children).find(
        child => React.isValidElement(child) && child.type === 'code'
      ) as React.ReactElement | undefined;

      console.log('Pre block children:', children);
      console.log('Code element:', codeElement);

      // If no code element found, render pre as is
      if (!codeElement) {
        return <pre {...props}>{children}</pre>;
      }

      // Get the language from the code element's data attribute
      const language = codeElement.props['data-language'];
      console.log('Language from data attribute:', language);

      return (
        <pre 
          className={clsx(
            "my-6 p-4 rounded-lg bg-code-bg overflow-x-auto",
            "border border-border",
            className
          )}
          {...props}
        >
          {language && (
            <div className="text-xs font-mono text-muted-foreground mb-2">
              {language}
            </div>
          )}
          {codeElement}
        </pre>
      );
    },
    blockquote: props => (
      <blockquote 
        {...props} 
        className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 py-2"
      />
    ),
    a: props => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        {...props}
        className="text-primary hover:text-primary/80 underline underline-offset-4"
      />
    ),
    strong: props => (
      <strong 
        {...props} 
        className="font-semibold text-card-foreground"
      />
    ),
    em: props => (
      <em 
        {...props} 
        className="italic text-card-foreground"
      />
    ),
    table: props => {
      const [isScrollable, setIsScrollable] = useState(false);
      const tableRef = useRef<HTMLTableElement>(null);

      useEffect(() => {
        const checkOverflow = () => {
          if (tableRef.current) {
            setIsScrollable(tableRef.current.scrollWidth > tableRef.current.clientWidth);
          }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
      }, []);

      return (
        <div className={clsx(
          "my-6 w-full",
          isScrollable && "overflow-x-auto shadow-sm"
        )}>
          <table 
            {...props} 
            ref={tableRef}
            className={clsx(
              "w-full border-collapse",
              isScrollable && "min-w-[600px]"
            )} 
          />
          {isScrollable && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              ← Scroll horizontally to see more →
            </div>
          )}
        </div>
      );
    },
    th: props => (
      <th 
        {...props} 
        className="border border-border bg-background px-4 py-2 text-left font-medium"
      />
    ),
    td: props => (
      <td 
        {...props} 
        className="border border-border px-4 py-2"
      />
    ),
    hr: () => (
      <hr className="my-8 border-border" />
    ),
    img: props => {
      const [isZoomed, setIsZoomed] = useState(false);
      const [isLoaded, setIsLoaded] = useState(false);

      return (
        <div className="relative group">
          <img
            {...props}
            className={clsx(
              "max-w-full h-auto rounded-lg shadow-sm my-6 transition-transform duration-200",
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in",
              !isLoaded && "blur-sm"
            )}
            loading="lazy"
            onClick={() => setIsZoomed(!isZoomed)}
            onLoad={() => setIsLoaded(true)}
          />
          <div className={clsx(
            "absolute top-2 right-2 space-x-2",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 rounded-md hover:bg-primary/10"
              aria-label="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 rounded-md hover:bg-primary/10"
              aria-label="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      );
    },
  };

  return (
    <div ref={contentRef || internalRef} className="prose prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkParse]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AdvancedMarkdown; 