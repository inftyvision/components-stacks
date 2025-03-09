'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const ThreeViewer = dynamic(() => import('./ThreeViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
});

interface GlbViewerProps {
  modelPath?: string;
}

export default function GlbViewer({ modelPath = '/glb/sample.glb' }: GlbViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">3D Model Viewer</h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <ThreeViewer modelPath={modelPath} />
      </motion.div>
    </div>
  );
} 