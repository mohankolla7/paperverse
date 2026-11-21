import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Station 1: Upload - Floating glass paper sheets drifting in a starfield
 */
export function StationUpload({ position = [0, 0, -15] }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Primary central glass paper sheet */}
      <mesh position={[0, 0, 0]} rotation={[0.1, -0.2, 0.05]}>
        <boxGeometry args={[4.2, 5.8, 0.06]} />
        <meshPhysicalMaterial
          color="#E8EAF6"
          roughness={0.1}
          metalness={0.1}
          transmission={0.88}
          thickness={0.4}
          ior={1.5}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Wireframe neon border on primary sheet */}
      <lineSegments position={[0, 0, 0]} rotation={[0.1, -0.2, 0.05]}>
        <edgesGeometry args={[new THREE.BoxGeometry(4.22, 5.82, 0.07)]} />
        <lineBasicMaterial color="#22D3EE" linewidth={2} />
      </lineSegments>

      {/* Second drifting paper sheet (cyan tint) */}
      <mesh position={[-2.8, 1.2, -2]} rotation={[-0.15, 0.3, -0.1]}>
        <boxGeometry args={[3.6, 5.0, 0.05]} />
        <meshPhysicalMaterial
          color="#22D3EE"
          roughness={0.2}
          transmission={0.8}
          thickness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Third drifting paper sheet (violet tint) */}
      <mesh position={[3.0, -1.0, -1.5]} rotation={[0.2, -0.35, 0.15]}>
        <boxGeometry args={[3.8, 5.2, 0.05]} />
        <meshPhysicalMaterial
          color="#7C3AED"
          roughness={0.2}
          transmission={0.8}
          thickness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Floating neon accent rings */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, 3.55, 64]} />
        <meshBasicMaterial color="#7C3AED" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Station 2: Compare - Glowing 3D table grid assembling itself
 */
export function StationCompare({ position = [15, 5, -50] }) {
  const gridRef = useRef();

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      gridRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  // Create a 3x3 array of comparison cells that pulse
  const cells = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      cells.push({ x: c * 2.2, y: r * 2.2, id: `${r}-${c}` });
    }
  }

  return (
    <group ref={gridRef} position={position}>
      {/* Assembling table cells */}
      {cells.map((cell, idx) => (
        <group key={cell.id} position={[cell.x, cell.y, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 1.8, 0.2]} />
            <meshStandardMaterial
              color="#090A1A"
              emissive={idx % 2 === 0 ? '#7C3AED' : '#22D3EE'}
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.82, 1.82, 0.22)]} />
            <lineBasicMaterial color={idx % 2 === 0 ? '#22D3EE' : '#F472B6'} />
          </lineSegments>
        </group>
      ))}

      {/* Surrounding comparison orbit ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[4.5, 0.05, 16, 64]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
    </group>
  );
}

/**
 * Station 3: Summarize - Big sheet folding down into a small glowing crystal
 */
export function StationSummarize({ position = [-15, -5, -90] }) {
  const crystalRef = useRef();
  const foldMeshRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.rotation.x = t * 0.6;
      crystalRef.current.rotation.y = t * 0.8;
      // Pulse scale
      const s = 1 + Math.sin(t * 2) * 0.15;
      crystalRef.current.scale.set(s, s, s);
    }
    if (foldMeshRef.current) {
      foldMeshRef.current.rotation.z = -t * 0.3;
      foldMeshRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Outer folding translucent origami panels */}
      <group ref={foldMeshRef}>
        <mesh position={[0, 0, 0]} rotation={[0.4, 0.4, 0]}>
          <octahedronGeometry args={[3.2, 0]} />
          <meshPhysicalMaterial
            color="#7C3AED"
            wireframe
            roughness={0.1}
            metalness={0.5}
            emissive="#7C3AED"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Inner glowing crystallized insight */}
      <mesh ref={crystalRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Point light emitted by crystal */}
      <pointLight color="#22D3EE" intensity={4} distance={10} />
    </group>
  );
}

/**
 * Station 4: Chat - Floating chat bubbles orbiting a pulsing orb
 */
export function StationChat({ position = [0, 10, -130] }) {
  const centralOrbRef = useRef();
  const orbitGroupRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (centralOrbRef.current) {
      centralOrbRef.current.rotation.y = t * 0.5;
      const s = 1.6 + Math.sin(t * 3) * 0.15;
      centralOrbRef.current.scale.set(s, s, s);
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = t * 0.6;
      orbitGroupRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Central pulsing knowledge orb */}
      <mesh ref={centralOrbRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#F472B6"
          emissive="#F472B6"
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <pointLight color="#F472B6" intensity={5} distance={12} />

      {/* Orbiting Chat Bubbles */}
      <group ref={orbitGroupRef}>
        {/* Bubble 1: User query */}
        <mesh position={[3.2, 0.8, 0]}>
          <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Bubble 2: Grounded assistant answer */}
        <mesh position={[-3.2, -0.6, 1.5]}>
          <capsuleGeometry args={[0.5, 1.6, 8, 16]} />
          <meshStandardMaterial
            color="#7C3AED"
            emissive="#7C3AED"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Bubble 3: Exact citation badge */}
        <mesh position={[0, -2.8, -2.5]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={1.0}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Station 5: Generate - Rotating wireframe shape morphing into a title and abstract
 */
export function StationGenerate({ position = [20, -8, -170] }) {
  const knotRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.5;
      knotRef.current.rotation.y = t * 0.7;
      knotRef.current.rotation.z = t * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Morphing torus knot of idea synthesis */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[2.0, 0.5, 128, 32]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#22D3EE"
          emissiveIntensity={0.7}
          wireframe
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Halo of generative ideas */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[3.2, 3.3, 64]} />
        <meshBasicMaterial color="#F472B6" side={THREE.DoubleSide} />
      </mesh>

      <pointLight color="#10B981" intensity={4} distance={12} />
    </group>
  );
}

/**
 * Station 6: Study - Flip-card style cubes showing quiz questions
 */
export function StationStudy({ position = [0, 0, -210] }) {
  const cubesRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (cubesRef.current) {
      cubesRef.current.children.forEach((cube, idx) => {
        cube.rotation.y = t * 0.8 + idx * 1.2;
        cube.rotation.x = Math.sin(t + idx) * 0.3;
      });
    }
  });

  return (
    <group ref={cubesRef} position={position}>
      {/* Cube 1: Question block */}
      <group position={[-2.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshStandardMaterial
            color="#0F1126"
            emissive="#7C3AED"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.82, 1.82, 1.82)]} />
          <lineBasicMaterial color="#7C3AED" linewidth={2} />
        </lineSegments>
      </group>

      {/* Cube 2: Active recall center */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial
            color="#0F1126"
            emissive="#22D3EE"
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2.02, 2.02, 2.02)]} />
          <lineBasicMaterial color="#22D3EE" linewidth={2} />
        </lineSegments>
      </group>

      {/* Cube 3: Success explanation check */}
      <group position={[2.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshStandardMaterial
            color="#0F1126"
            emissive="#F59E0B"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.82, 1.82, 1.82)]} />
          <lineBasicMaterial color="#F59E0B" linewidth={2} />
        </lineSegments>
      </group>
    </group>
  );
}
