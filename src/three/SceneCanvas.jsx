import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CosmicStarfield } from './CosmicStarfield';
import { CameraFlight } from './CameraFlight';
import {
  StationUpload,
  StationCompare,
  StationSummarize,
  StationChat,
  StationGenerate,
  StationStudy
} from './Stations';

export default function SceneCanvas({ scrollProgress = 0, mousePos = { x: 0, y: 0 }, liteMode = false }) {
  if (liteMode) {
    return null; // Lite mode completely bypasses WebGL rendering to save battery & CPU
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 350 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.FogExp2('#05050F', 0.012);
        }}
      >
        <Suspense fallback={null}>
          {/* Cosmic Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 15]} intensity={1.2} color="#E8EAF6" />
          <pointLight position={[0, 0, 0]} intensity={2.5} color="#7C3AED" distance={40} />
          <pointLight position={[15, 5, -50]} intensity={2.5} color="#22D3EE" distance={40} />
          <pointLight position={[-15, -5, -90]} intensity={3.0} color="#7C3AED" distance={40} />
          <pointLight position={[0, 10, -130]} intensity={3.0} color="#F472B6" distance={40} />

          {/* Starfield Particles */}
          <CosmicStarfield count={2200} />

          {/* 6 Stations Along Cosmic Route */}
          <StationUpload position={[0, 0, -15]} />
          <StationCompare position={[15, 5, -50]} />
          <StationSummarize position={[-15, -5, -90]} />
          <StationChat position={[0, 10, -130]} />
          <StationGenerate position={[20, -8, -170]} />
          <StationStudy position={[0, 0, -210]} />

          {/* Camera flight controller */}
          <CameraFlight scrollProgress={scrollProgress} mousePos={mousePos} />

          {/* Postprocessing Bloom */}
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
              intensity={1.1}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
