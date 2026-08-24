"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

function Microchip() {
  const chipRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (chipRef.current) {
      const time = state.clock.getElapsedTime();
      chipRef.current.rotation.y = time * 0.3;
      chipRef.current.rotation.x = Math.sin(time * 0.2) * 0.15;
    }
  });

  return (
    <group ref={chipRef} rotation={[0.4, 0, 0]}>
      {/* Substrate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.2, 2.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Die Cover */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Gold pins left/right */}
      {[-1.1, -0.7, -0.3, 0.1, 0.5, 0.9].map((z, idx) => (
        <group key={idx}>
          {/* Left Pins */}
          <mesh position={[-1.35, -0.05, z]}>
            <boxGeometry args={[0.3, 0.08, 0.15]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Right Pins */}
          <mesh position={[1.35, -0.05, z]}>
            <boxGeometry args={[0.3, 0.08, 0.15]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Top Pins */}
          <mesh position={[z, -0.05, -1.35]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.15]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Bottom Pins */}
          <mesh position={[z, -0.05, 1.35]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.15]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function HardwareCore3D() {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="h-48 w-full relative"
    >
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Microchip />
      </Canvas>
    </motion.div>
  );
}
