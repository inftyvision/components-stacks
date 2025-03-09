'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ThreeViewerProps {
  modelPath: string;
}

export default function ThreeViewer({ modelPath }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111827');

    // Setup camera with ~50mm equivalent focal length (40-45 degrees FOV)
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Center and scale model to fit view
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Get the max side length
        const maxSize = Math.max(size.x, size.y, size.z);
        
        // Calculate scale to fit in view with some padding
        const fov = 45; // Our camera's FOV
        const padding = 1.2; // Add 20% padding around the object
        const distance = (maxSize * padding) / (2 * Math.tan((fov * Math.PI) / 360));
        
        // Center the model
        gltf.scene.position.x = -center.x;
        gltf.scene.position.y = -center.y;
        gltf.scene.position.z = -center.z;
        
        scene.add(gltf.scene);
        
        // Position camera to frame the object
        camera.position.z = distance;
        
        // Update controls
        controls.target.set(0, 0, 0);
        controls.minDistance = distance * 0.5;
        controls.maxDistance = distance * 2;
        controls.update();
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Handle resize
    function handleResize() {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelPath]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">3D Model Viewer</h2>
      </div>
      <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <div ref={containerRef} className="h-[600px] relative" />
      </div>
    </div>
  );
} 