import { useState, useEffect } from 'react';

interface JsonTextViewProps {
  data: any;
  onDataChange?: (newData: any) => void;
}

export default function JsonTextView({ data, onDataChange }: JsonTextViewProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const parsed = JSON.parse(newText);
      setError('');
      onDataChange?.(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-[500px] font-mono text-sm p-4 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        spellCheck={false}
      />
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 text-red-200 p-2 rounded border border-red-700">
          {error}
        </div>
      )}
    </div>
  );
} 