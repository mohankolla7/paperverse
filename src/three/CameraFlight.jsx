import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Waypoints corresponding to the 6 Stations in 3D space
export const FLIGHT_WAYPOINTS = [
  new THREE.Vector3(0, 0, 5),      // 0.0: Station 1 "Upload"
  new THREE.Vector3(15, 5, -35),   // 0.2: Station 2 "Compare"
  new THREE.Vector3(-15, -5, -75), // 0.4: Station 3 "Summarize"
  new THREE.Vector3(0, 10, -115),  // 0.6: Station 4 "Chat"
  new THREE.Vector3(20, -8, -155), // 0.8: Station 5 "Generate"
  new THREE.Vector3(0, 0, -195),   // 0.95: Station 6 "Study"
  new THREE.Vector3(0, 0, -230)    // 1.0: Destination / Dashboard
];

export function CameraFlight({ scrollProgress = 0, mousePos = { x: 0, y: 0 } }) {
  // Build continuous smooth Catmull-Rom spline curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(FLIGHT_WAYPOINTS, false, 'catmullrom', 0.5);
  }, []);

  const currentLookAt = useRef(new THREE.Vector3(0, 0, -20));

  useFrame((state) => {
    // Clamp progress between 0 and 1
    const t = Math.max(0, Math.min(1, scrollProgress));

    // Desired camera position along spline
    const point = curve.getPointAt(t);

    // Look-ahead target (offset slightly forward on curve)
    const lookAheadT = Math.min(t + 0.04, 1.0);
    const targetPoint = curve.getPointAt(lookAheadT);

    // Mouse parallax offset (gentle reaction to cursor)
    const parallaxX = mousePos.x * 2.2;
    const parallaxY = mousePos.y * 1.5;

    // Smoothly interpolate camera position
    state.camera.position.x += (point.x + parallaxX - state.camera.position.x) * 0.08;
    state.camera.position.y += (point.y + parallaxY - state.camera.position.y) * 0.08;
    state.camera.position.z += (point.z - state.camera.position.z) * 0.08;

    // Smoothly interpolate lookAt target
    currentLookAt.current.lerp(targetPoint, 0.08);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
