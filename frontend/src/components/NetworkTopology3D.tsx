"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";

interface Machine {
  id: string;
  hostname: string;
  status: string;
}

interface NetworkTopology3DProps {
  machines: Machine[];
}

function Node({ machine, position }: { machine: Machine; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 3) * 0.08;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = machine.status === "online" ? "#00ffcc" : "#ff003c";

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Label */}
      <Html distanceFactor={10}>
        <div className="bg-slate-950/80 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white font-mono whitespace-nowrap pointer-events-none select-none">
          {machine.hostname}
        </div>
      </Html>
    </group>
  );
}

export default function NetworkTopology3D({ machines }: NetworkTopology3DProps) {
  const nodePositions = useMemo(() => {
    return machines.map((_, i) => {
      const angle = (i / machines.length) * Math.PI * 2;
      const x = Math.cos(angle) * 3;
      const z = Math.sin(angle) * 3;
      const y = (Math.random() - 0.5) * 2;
      return [x, y, z] as [number, number, number];
    });
  }, [machines]);

  if (machines.length === 0) {
    return null;
  }

  return (
    <div className="h-64 w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-xs text-white/50">
        NETWORK TOPOLOGY MAP [DRAG TO ROTATE]
      </div>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        
        {/* Render nodes */}
        {machines.map((machine, idx) => (
          <Node
            key={machine.id}
            machine={machine}
            position={nodePositions[idx] || [0, 0, 0]}
          />
        ))}

        {/* Render connection lines */}
        {nodePositions.map((pos, idx) => {
          if (idx === 0) return null;
          return (
            <Line
              key={idx}
              points={[nodePositions[0] || [0, 0, 0], pos]}
              color="#00bfff"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
