'use client';

import { useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import type { ComponentProps } from 'react';
import { ClipboardIcon, CheckIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React from 'react';

interface AdvancedMarkdownProps {
  content: string;
  onCopy?: (text: string) => void;
  onZoom?: (level: number) => void;
  className?: string;
}

interface MarkdownComponentProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
  children?: React.ReactNode;
  inline?: boolean;
}

const AdvancedMarkdown: React.FC<AdvancedMarkdownProps> = ({ content, onCopy, onZoom, className }) => {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState(1);

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
        className="text-2xl font-bold text-card-foreground mb-6 pb-2 border-b border-border"
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
    ul: (props: MarkdownComponentProps) => (
      <ul 
        {...props} 
        className="list-disc space-y-2 mb-4 ml-4"
      />
    ),
    ol: (props: MarkdownComponentProps) => {
      const hasNestedContent = React.Children.toArray(props.children).some(
        child => typeof child === 'object' && 'type' in child
      );
      
      return (
        <ol 
          {...props} 
          className={clsx(
            "space-y-2 mb-4",
            hasNestedContent ? "ml-8" : "ml-4",
            "list-decimal"
          )}
        />
      );
    },
    li: (props: MarkdownComponentProps) => {
      const hasNestedContent = React.Children.toArray(props.children).some(
        child => typeof child === 'object' && 'type' in child
      );
      
      return (
        <li 
          {...props} 
          className={clsx(
            "text-card-foreground leading-relaxed",
            hasNestedContent && "ml-4",
            "pl-1"
          )}
        />
      );
    },
    code: ({ inline, className, children, ...props }: MarkdownComponentProps) => {
      const content = React.Children.toArray(children).join('').trim();
      console.log('Code block className:', className);
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      console.log('Detected language:', language);
      
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

      // For block code, ensure we pass the language class
      return (
        <code 
          className={clsx("font-mono text-sm block", className)} 
          data-language={language}
          {...props}
        >
          {content}
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
    table: props => (
      <div className="my-6 w-full">
        <table {...props} className="w-full border-collapse" />
      </div>
    ),
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
    img: props => (
      <img
        {...props}
        className="max-w-full h-auto rounded-lg shadow-sm my-6"
        loading="lazy"
      />
    ),
  };

  return (
    <div className={clsx("prose prose-invert max-w-none", className)}>
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