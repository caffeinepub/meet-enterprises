import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 30;

function FloatingPoints() {
  const mesh = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT); // y velocity per particle

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22; // x: wide spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14; // y: full height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4; // z: slight depth

      vel[i] = 0.003 + Math.random() * 0.005; // drift speed
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const attr = mesh.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] += velocities[i];
      // Wrap to bottom when reaching top
      if (arr[i * 3 + 1] > 7) {
        arr[i * 3 + 1] = -7;
        arr[i * 3] = (Math.random() - 0.5) * 22; // randomise x on reset
      }
    }
    attr.needsUpdate = true;
  });

  const goldColor = useMemo(() => new THREE.Color(0xd4af37), []);

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={goldColor}
        size={0.04}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

class ParticlesErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function GlobalParticles() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.35,
      }}
    >
      <ParticlesErrorBoundary>
        <Canvas
          dpr={[1, 1]}
          camera={{ position: [0, 0, 8], fov: 75 }}
          gl={{ antialias: false, alpha: true }}
          style={{ background: "transparent" }}
        >
          <FloatingPoints />
        </Canvas>
      </ParticlesErrorBoundary>
    </div>
  );
}
