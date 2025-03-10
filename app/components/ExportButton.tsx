import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type ExportFormat = 'jpg' | 'png' | 'svg' | 'pdf';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, className }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!targetRef.current || isExporting) return;
    setIsExporting(true);
    setShowMenu(false);

    try {
      const element = targetRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        background: undefined
      });

      const dataUrl = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`);
      
      const link = document.createElement('a');
      link.download = `markdown-export-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={clsx("relative", className)}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={clsx(
          "px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20",
          "transition-colors duration-200 flex items-center space-x-2",
          isExporting && "opacity-50 cursor-not-allowed"
        )}
        disabled={isExporting}
      >
        <ArrowDownTrayIcon className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-primary">Export</span>
      </button>
      
      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 py-2 w-48 bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          {(['jpg', 'png', 'svg', 'pdf'] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className={clsx(
                "w-full px-4 py-2 text-sm text-left hover:bg-accent",
                "transition-colors duration-200"
              )}
              disabled={isExporting}
            >
              Export as {format.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 