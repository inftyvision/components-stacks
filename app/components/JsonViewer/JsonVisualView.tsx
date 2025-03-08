import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface JsonVisualViewProps {
  data: any;
  onDataChange?: (newData: any) => void;
}

interface JsonNodeProps {
  name: string;
  value: any;
  depth?: number;
  onEdit?: (newValue: any) => void;
}

const JsonNode = ({ name, value, depth = 0, onEdit }: JsonNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number | boolean>(
    typeof value === 'object' ? '' : value
  );

  const handleEdit = (e: React.MouseEvent) => {
    if (typeof value !== 'object') {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onEdit) {
      let parsedValue: any = editValue;
      if (typeof value === 'number') parsedValue = Number(editValue);
      if (typeof value === 'boolean') parsedValue = String(editValue) === 'true';
      onEdit(parsedValue);
    }
  };

  const handleToggle = () => {
    if (isObject) {
      setIsExpanded(!isExpanded);
    }
  };

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mb-1.5"
      style={{ paddingLeft: `${depth * 10}px` }}
    >
      <div 
        className="flex items-center space-x-2 group"
        onClick={handleToggle}
      >
        <div className={`p-1 text-gray-400 transition-transform duration-200 ${isObject ? '' : 'invisible'}`}>
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </div>
        <div
          className={`flex-1 p-2 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 ${
            isObject ? 'cursor-pointer' : ''
          }`}
          onClick={handleEdit}
        >
          <span className="font-medium text-indigo-400">{name}</span>
          {!isObject && (
            <span className="mx-2 text-gray-500">:</span>
          )}
          {!isObject && !isEditing && (
            <span className={
              typeof value === 'string'
                ? 'text-green-400'
                : typeof value === 'number'
                ? 'text-yellow-400'
                : 'text-red-400'
            }>
              {String(value)}
            </span>
          )}
          {!isObject && isEditing && (
            <input
              type="text"
              value={String(editValue)}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onClick={(e) => e.stopPropagation()}
              className="ml-2 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          )}
          {isObject && (
            <span className="text-gray-400 text-sm ml-2">
              {isArray ? 'Array' : 'Object'} ({Object.keys(value).length} items)
            </span>
          )}
        </div>
      </div>

      {isObject && isExpanded && (
        <div className="mt-1.5">
          {Object.entries(value).map(([key, val]) => (
            <JsonNode
              key={key}
              name={key}
              value={val}
              depth={depth + 1}
              onEdit={
                onEdit
                  ? (newValue) => {
                      const newObj = isArray
                        ? [...value]
                        : { ...value };
                      newObj[key] = newValue;
                      onEdit(newObj);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function JsonVisualView({ data, onDataChange }: JsonVisualViewProps) {
  return (
    <div className="font-mono text-sm">
      <JsonNode name="root" value={data} onEdit={onDataChange} />
    </div>
  );
} 